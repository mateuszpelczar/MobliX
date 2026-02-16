package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.comprehend.model.*;

import java.util.*;
import java.util.regex.Pattern;


@Service
public class ContentModerationService {

    private final ComprehendClient comprehendClient;
    private final boolean moderationEnabled;
    private final double minConfidence;

    // Lista wulgaryzmów i obraźliwych słów (polskie, angielskie i inne)
    private static final Set<String> BLOCKED_WORDS = new HashSet<>();
    
    // Wzorce regex dla częściowych dopasowań
    private static final List<Pattern> BLOCKED_PATTERNS = new ArrayList<>();

    static {
        
        BLOCKED_WORDS.addAll(Arrays.asList(
            "kurwa", "kurwy", "kurwę", "kurwo", "kurwą", "kurewski", "kurewsko",
            "chuj", "chuja", "chujem", "chuju", "chujowy", "chujowo", "chujnia",
            "pierdolić", "pierdol", "pierdolę", "pierdoli", "pierdolony", "pierdolić",
            "pierdolnij", "pierdolnąć", "spierdolić", "spierdolaj", "opierdol",
            "jebać", "jebany", "jebana", "jebane", "jebie", "jebię", "pojebany",
            "wyjebać", "zajebisty", "zajebiste", "rozjebać", "zjebać", "zjebany",
            "skurwysyn", "skurwiel", "skurwysyny", "skurwielu",
            "cipa", "cipę", "cipka", "cipki",
            "pizda", "pizdą", "pizdy",
            "dupa", "dupą", "dupek", "dupsko",
            "gówno", "gówna", "gównem", "gówniarze", "gówniany",
            "srać", "sraj", "sraka", "zasrany",
            "pedał", "pedały", "pedale",
            "dziwka", "dziwki", "dziwko",
            "szmata", "szmaty", "szmato",
            "cwel", "cwele", "cwelu",
            "frajer", "frajerzy",
            "debil", "debile", "debilny",
            "idiota", "idioci", "idiotka",
            "kretyn", "kretyni", "kretyństwo",
            "spierdalaj", "spierdal", "wypierdalaj", "odpierdol",
            "morda", "mordę", "mordo",
            "łajza", "łajzy",
            "gnój", "gnoju", "gnoje",
            "ciul", "ciulu",
            "parch", "parchu",
            "żyd", "żydy", "żydek", 
            "ciapaty", "ciapak",
            "czarnuch", "czarnuchy",
            "bambus", "bambusie"
        ));
        
        
        BLOCKED_WORDS.addAll(Arrays.asList(
            "fuck", "fucking", "fucked", "fucker", "fucks", "motherfucker", "motherfucking",
            "shit", "shitty", "bullshit", "shitting",
            "ass", "asshole", "arse", "arsehole",
            "bitch", "bitches", "bitchy", "son of a bitch",
            "bastard", "bastards",
            "damn", "damned", "goddamn",
            "cunt", "cunts",
            "dick", "dicks", "dickhead",
            "cock", "cocks", "cocksucker",
            "pussy", "pussies",
            "whore", "whores",
            "slut", "sluts", "slutty",
            "nigger", "nigga", "niggas",
            "retard", "retarded",
            "faggot", "fag", "fags",
            "wanker", "wankers",
            "twat", "twats",
            "prick", "pricks",
            "bollocks",
            "bugger",
            "bloody hell",
            "crap", "crappy"
        ));
        
        
        BLOCKED_WORDS.addAll(Arrays.asList(
            "scheiße", "scheisse", "scheiss",
            "arschloch", "arsch",
            "hurensohn", "hure",
            "wichser", "fick", "ficken"
        ));
        
        // Wzorce regex dla wariantów pisowni
        BLOCKED_PATTERNS.add(Pattern.compile("k[u]+r[w]+[a]+", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("ch[u]+j", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("p[i]+[e]+rd[o]+l", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("j[e]+b[a]+", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("f[u]+c+k", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("s+h+[i]+t+", Pattern.CASE_INSENSITIVE));
        BLOCKED_PATTERNS.add(Pattern.compile("b[i]+t+ch", Pattern.CASE_INSENSITIVE));
    }

    public ContentModerationService(
            ComprehendClient comprehendClient,
            @Value("${aws.moderation.enabled:true}") boolean moderationEnabled,
            @Value("${aws.comprehend.min-confidence:0.7}") double minConfidence) {
        this.comprehendClient = comprehendClient;
        this.moderationEnabled = moderationEnabled;
        this.minConfidence = minConfidence;
    }

    //moderacja tekstu
    public List<String> moderateText(String title, String description) {
        List<String> issues = new ArrayList<>();
        
        if (!moderationEnabled) {
            System.out.println("[ContentModeration] Moderacja treści wyłączona");
            return issues;
        }
        
        String fullText = (title != null ? title : "") + " " + (description != null ? description : "");
        fullText = fullText.trim();
        
        if (fullText.isEmpty()) {
            return issues;
        }
        
        
        List<String> blockedWordsFound = checkBlockedWords(fullText);
        if (!blockedWordsFound.isEmpty()) {
            issues.add("zawiera wulgaryzmy: " + String.join(", ", blockedWordsFound));
        }
        
       
        try {
            
            String language = detectLanguage(fullText);
            System.out.println("[ContentModeration] Wykryty język: " + language);
            
            
            if (isLanguageSupported(language)) {
                SentimentResult sentiment = analyzeSentiment(fullText, language);
                
                if (sentiment != null) {
                    System.out.println("[ContentModeration] Sentyment: " + sentiment.sentiment + 
                                     ", negative score: " + sentiment.negativeScore);
                    
                    
                    if (sentiment.sentiment == SentimentType.NEGATIVE && 
                        sentiment.negativeScore > 0.9) {
                       
                        System.out.println("[ContentModeration] Wykryto silnie negatywny sentyment");
                    }
                }
            }
            
        } catch (ComprehendException e) {
            System.err.println("[ContentModeration] Błąd Comprehend: " + e.getMessage());
            
        }
        
        return issues;
    }

    
    private List<String> checkBlockedWords(String text) {
        List<String> found = new ArrayList<>();
        String lowerText = text.toLowerCase();
        
        
        String[] words = lowerText.split("[\\s.,!?;:\"'()\\[\\]{}]+");
        
        for (String word : words) {
            if (word.isEmpty()) continue;
            
            
            if (BLOCKED_WORDS.contains(word)) {
                if (!found.contains(word)) {
                    found.add(maskWord(word));
                }
            }
        }
        
        
        for (Pattern pattern : BLOCKED_PATTERNS) {
            if (pattern.matcher(lowerText).find()) {
                
                java.util.regex.Matcher matcher = pattern.matcher(lowerText);
                while (matcher.find()) {
                    String match = matcher.group();
                    String masked = maskWord(match);
                    if (!found.contains(masked)) {
                        found.add(masked);
                    }
                }
            }
        }
        
        return found;
    }

    
    private String maskWord(String word) {
        if (word.length() <= 2) {
            return word.charAt(0) + "*";
        }
        return word.charAt(0) + "*".repeat(word.length() - 2) + word.charAt(word.length() - 1);
    }

    
    private String detectLanguage(String text) {
        try {
            DetectDominantLanguageRequest request = DetectDominantLanguageRequest.builder()
                    .text(truncateText(text, 5000))
                    .build();
            
            DetectDominantLanguageResponse response = comprehendClient.detectDominantLanguage(request);
            
            if (!response.languages().isEmpty()) {
                return response.languages().get(0).languageCode();
            }
        } catch (Exception e) {
            System.err.println("[ContentModeration] Błąd wykrywania języka: " + e.getMessage());
        }
        
        return "pl"; 
    }

    
    private boolean isLanguageSupported(String languageCode) {
        return Set.of("en", "es", "fr", "de", "it", "pt", "ar", "hi", "ja", "ko", "zh", "zh-TW")
                .contains(languageCode);
    }

    
    private SentimentResult analyzeSentiment(String text, String language) {
        try {
            DetectSentimentRequest request = DetectSentimentRequest.builder()
                    .text(truncateText(text, 5000))
                    .languageCode(language)
                    .build();
            
            DetectSentimentResponse response = comprehendClient.detectSentiment(request);
            
            SentimentResult result = new SentimentResult();
            result.sentiment = response.sentiment();
            result.negativeScore = response.sentimentScore().negative();
            result.positiveScore = response.sentimentScore().positive();
            
            return result;
        } catch (Exception e) {
            System.err.println("[ContentModeration] Błąd analizy sentymentu: " + e.getMessage());
            return null;
        }
    }

    
    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private static class SentimentResult {
        SentimentType sentiment;
        double negativeScore;
        double positiveScore;
    }
}


