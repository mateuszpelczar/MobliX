package com.example.backend.service;

import com.example.backend.model.ContentPage;
import com.example.backend.repository.ContentPageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContentPageService {

    private final ContentPageRepository contentPageRepository;

    public ContentPageService(ContentPageRepository contentPageRepository) {
        this.contentPageRepository = contentPageRepository;
    }

    // Pobierz wszystkie strony
    public List<ContentPage> getAllPages() {
        return contentPageRepository.findAll();
    }

    // Pobierz stronę po slug
    public Optional<ContentPage> getPageBySlug(String slug) {
        return contentPageRepository.findBySlug(slug);
    }

    // Pobierz stronę po ID
    public Optional<ContentPage> getPageById(Long id) {
        return contentPageRepository.findById(id);
    }

    // Utwórz nową stronę
    @Transactional
    public ContentPage createPage(ContentPage page) {
        page.setLastUpdated(LocalDateTime.now());
        return contentPageRepository.save(page);
    }

    // Zaktualizuj istniejącą stronę
    @Transactional
    public ContentPage updatePage(Long id, ContentPage updatedPage, String updatedBy) {
        ContentPage existingPage = contentPageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content page not found with id: " + id));

        existingPage.setTitle(updatedPage.getTitle());
        existingPage.setContent(updatedPage.getContent());
        existingPage.setUpdatedBy(updatedBy);
        existingPage.setLastUpdated(LocalDateTime.now());

        return contentPageRepository.save(existingPage);
    }

    // Usuń stronę
    @Transactional
    public void deletePage(Long id) {
        contentPageRepository.deleteById(id);
    }

    // Inicjalizuj domyślne strony (jeśli nie istnieją)
    @Transactional
    public void initializeDefaultPages() {
        // Zasady Bezpieczeństwa
        createDefaultPageIfNotExists("zasady-bezpieczenstwa", "Zasady bezpieczeństwa", 
            "<h1 class=\"text-2xl sm:text-3xl font-bold text-gray-900\">Zasady bezpieczeństwa</h1>" +
            "<p class=\"text-sm text-gray-600\">Ostatnia aktualizacja: 19.08.2025</p>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">1. Ogólne zasady ostrożności</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Korzystaj z czatu w serwisie i nie przechodź na podejrzane linki zewnętrzne.</li>" +
            "<li>Nie udostępniaj danych logowania, numerów kart, kodów BLIK ani jednorazowych kodów autoryzacyjnych.</li>" +
            "<li>Jeśli coś budzi Twoje wątpliwości – przerwij rozmowę i zgłoś ogłoszenie.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">2. Weryfikacja ogłoszeń i sprzedających</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Sprawdź historię konta i opinie użytkownika (jeśli dostępne).</li>" +
            "<li>Uważaj na ceny znacznie zaniżone względem rynku.</li>" +
            "<li>Proś o dodatkowe zdjęcia i informacje (np. numer IMEI, stan baterii, akcesoria).</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">3. Płatności i bezpieczeństwo transakcji</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>MobliX nie pośredniczy w płatnościach – nie wysyłaj zaliczek nieznajomym.</li>" +
            "<li>Unikaj przesyłania środków przez szybkie przelewy na prośbę z linków przesłanych w czacie.</li>" +
            "<li>Przy odbiorze osobistym płać po sprawdzeniu urządzenia; przy wysyłce rozważ usługę z ubezpieczeniem i możliwością sprawdzenia przesyłki.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">4. Odbiór i sprawdzenie telefonu</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Sprawdź zgodność numeru IMEI z dokumentami/ustaleniami oraz czy urządzenie nie jest zablokowane (np. iCloud/FRP).</li>" +
            "<li>Przetestuj podstawowe funkcje: ekran, dotyk, bateria, aparat, głośnik, mikrofon, port ładowania, sieć.</li>" +
            "<li>Spisz prosty protokół odbioru (data, model, cena, stan) i poproś o potwierdzenie.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">5. Oszustwa i phishing</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Nie klikaj w linki do \"szybkich płatności\", \"potwierdzeń wysyłki\" lub \"zwrotów\" przesłane przez obce osoby.</li>" +
            "<li>Nie podawaj kodów BLIK ani haseł na prośbę rozmówcy.</li>" +
            "<li>Adresy stron sprawdzaj dokładnie (literówki, dziwne domeny, brak certyfikatu HTTPS).</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">6. Ochrona konta</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Używaj silnego, unikalnego hasła; nie udostępniaj go nikomu.</li>" +
            "<li>Wylogowuj się na współdzielonych urządzeniach. Aktualizuj przeglądarkę i system.</li>" +
            "<li>Uważaj na publiczne Wi‑Fi – unikaj logowania w niezaufanych sieciach.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">7. Zgłaszanie nadużyć</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Zgłaszaj podejrzane ogłoszenia i wiadomości poprzez dostępne w serwisie formularze.</li>" +
            "<li>W przypadku realnego zagrożenia lub przestępstwa skontaktuj się z odpowiednimi służbami.</li>" +
            "<li>Przekaż zrzuty ekranu, numery telefonów i inne istotne informacje ułatwiające weryfikację.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">8. Dane osobowe i prywatność</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Udostępniaj tylko niezbędne dane. Nigdy nie przesyłaj skanów dokumentów tożsamości.</li>" +
            "<li>Zapoznaj się z Polityką cookies i ustaw preferencje w Ustawieniach plików cookies.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">9. Co robi MobliX</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Udostępnia narzędzia kontaktu i mechanizmy zgłaszania naruszeń.</li>" +
            "<li>Może moderować, ukrywać lub usuwać treści niezgodne z Regulaminem lub prawem.</li>" +
            "<li>Nie pośredniczy w płatnościach i dostawie – warunki ustalają użytkownicy między sobą.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">10. W razie problemów</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Przerwij rozmowę i nie wykonuj płatności, jeśli masz wątpliwości.</li>" +
            "<li>Zmień hasło do konta, jeśli podejrzewasz przejęcie.</li>" +
            "<li>Skontaktuj się z nami przez zakładkę \"Kontakt\" i rozważ zgłoszenie sprawy organom ścigania.</li></ul></section>");
        
        
        
       // Jak Działa MobliX
        createDefaultPageIfNotExists("jak-dziala-moblix", "Jak działa MobliX", 
            "<h1 class=\"text-2xl sm:text-3xl font-bold text-gray-900\">Jak działa MobliX</h1>" +
            "<p class=\"text-gray-700 leading-relaxed\">MobliX to platforma ogłoszeniowa skoncentrowana na smartfonach. " +
            "Łączymy osoby, które sprzedają i kupują telefony różnych marek i modeli. Z MobliX łatwo wyszukasz konkretny model, " +
            "porównasz oferty, skontaktujesz się ze sprzedawcą i bezpiecznie sfinalizujesz zakup.</p>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Wyszukiwanie i filtrowanie</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Wyszukuj smartfony po <strong>marce</strong>, <strong>modelu</strong>, <strong>pamięci</strong> czy <strong>kolorze</strong>.</li>" +
            "<li>Filtruj po <strong>cenie</strong>, <strong>stanie urządzenia</strong> (nowy/używany), a także innych parametrach.</li>" +
            "<li>Sortuj wyniki według trafności, ceny lub daty dodania.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Konto i profil</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Załóż konto, aby <strong>dodawać ogłoszenia</strong> i zarządzać nimi.</li>" +
            "<li>Uzupełnij <strong>dane profilowe</strong> i buduj <strong>wiarygodność</strong> dzięki ocenom.</li>" +
            "<li>Z panelu użytkownika masz szybki dostęp do wiadomości, ogłoszeń i ustawień profilu.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Dodawanie ogłoszeń</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Dodaj tytuł, opis, cenę, wybierz markę i pozostałe parametry oraz dodaj <strong>zdjęcia</strong>.</li>" +
            "<li>Edytuj lub usuwaj swoje oferty w dowolnym momencie.</li>" +
            "<li>Udzielaj odpowiedzi na pytania kupujących i negocjuj warunki.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Komunikacja między użytkownikami</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Wysyłaj <strong>wiadomości</strong> bezpośrednio do sprzedającego lub kupującego.</li>" +
            "<li>Otrzymuj powiadomienia o nowych wiadomościach i odpowiedziach.</li>" +
            "<li>Ustalaj szczegóły transakcji i wygodny sposób odbioru/wysyłki.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Zakupy i bezpieczeństwo</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Porównuj oferty i wybierz najlepszą dla siebie.</li>" +
            "<li>Finalizuj zakup na bezpiecznych warunkach uzgodnionych między stronami.</li>" +
            "<li>Sprawdź <strong>Zasady bezpieczeństwa</strong> i kupuj świadomie.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">Moderacja i administracja</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Zespół dba o porządek i reaguje na zgłoszenia nieodpowiednich treści.</li>" +
            "<li>Administratorzy mogą <strong>edytować/usunąć ogłoszenia</strong> naruszające regulamin, przeglądać logi i raporty.</li></ul></section>" +
            "<div class=\"bg-gray-50 border rounded-lg p-4 text-gray-700\">" +
            "Masz pytania? Zajrzyj do sekcji: \"Zasady bezpieczeństwa\", \"Popularne wyszukiwania\", \"Regulamin\" oraz \"Polityka cookies\" w stopce.</div>");
        
        // Regulamin - PEŁNA WERSJA
        createDefaultPageIfNotExists("regulamin", "Regulamin serwisu MobliX", 
            "<h1 class=\"text-2xl sm:text-3xl font-bold text-gray-900\">Regulamin serwisu MobliX</h1>" +
            "<p class=\"text-sm text-gray-600\">Ostatnia aktualizacja: 18.08.2025</p>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">1. Postanowienia ogólne</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>MobliX to platforma ogłoszeniowa umożliwiająca publikowanie i przeglądanie ogłoszeń dotyczących smartfonów.</li>" +
            "<li>MobliX nie prowadzi sprzedaży i nie jest stroną transakcji między użytkownikami.</li>" +
            "<li>Korzystając z serwisu, akceptujesz niniejszy Regulamin oraz Politykę cookies.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">2. Zakres usług</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Użytkownicy niezalogowani mogą przeglądać, wyszukiwać i filtrować ogłoszenia.</li>" +
            "<li>Użytkownicy zalogowani mogą dodawać, edytować i usuwać własne ogłoszenia.</li>" +
            "<li>Kontakt między stronami odbywa się przez wiadomości w serwisie (Czat -> Wyślij wiadomość) lub telefonicznie (przycisk \"Zadzwoń\").</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">3. Rejestracja i konto użytkownika</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Użytkownik zobowiązany jest do podania prawdziwych danych podczas rejestracji.</li>" +
            "<li>Każdy użytkownik odpowiada za bezpieczeństwo swojego hasła.</li>" +
            "<li>Zabrania się udostępniania konta osobom trzecim.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">4. Dodawanie ogłoszeń</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Ogłoszenia muszą dotyczyć smartfonów i być zgodne z prawem.</li>" +
            "<li>Zabronione są ogłoszenia zawierające treści obraźliwe, nielegalne lub wprowadzające w błąd.</li>" +
            "<li>MobliX zastrzega sobie prawo do moderacji i usuwania ogłoszeń niezgodnych z regulaminem.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">5. Odpowiedzialność</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>MobliX nie ponosi odpowiedzialności za jakość, autentyczność lub legalność oferowanych produktów.</li>" +
            "<li>Użytkownicy zawierają transakcje na własną odpowiedzialność.</li>" +
            "<li>Platforma nie jest stroną umów kupna-sprzedaży między użytkownikami.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">6. Ochrona danych osobowych</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Dane osobowe przetwarzane są zgodnie z RODO.</li>" +
            "<li>Szczegóły w Polityce Prywatności dostępnej na stronie.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">7. Postanowienia końcowe</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>MobliX zastrzega sobie prawo do zmiany regulaminu.</li>" +
            "<li>O zmianach użytkownicy zostaną poinformowani w serwisie.</li>" +
            "<li>W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego.</li></ul></section>");
        
        
       // Polityka Cookies - PEŁNA WERSJA
        createDefaultPageIfNotExists("polityka-cookies", "Polityka plików cookies", 
            "<h1 class=\"text-2xl sm:text-3xl font-bold text-gray-900\">Polityka plików cookies</h1>" +
            "<p class=\"text-sm text-gray-600\">Ostatnia aktualizacja: 18.08.2025</p>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">1. Czym są pliki cookies?</h2>" +
            "<p class=\"text-gray-700\">Cookies to niewielkie pliki tekstowe zapisywane na Twoim urządzeniu podczas korzystania z serwisu. " +
            "Umożliwiają m.in. zapamiętanie ustawień, utrzymanie sesji logowania oraz analizę sposobu używania serwisu.</p></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">2. Jakich plików cookies używamy?</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Niezbędne – wymagane do prawidłowego działania serwisu (np. utrzymanie sesji, bezpieczeństwo).</li>" +
            "<li>Analityczne/wydajnościowe – pomagają zrozumieć, jak użytkownicy korzystają z serwisu (statystyki, poprawa UX).</li>" +
            "<li>Funkcjonalne – zapamiętują Twoje preferencje (np. wybrane filtry, układ listy).</li>" +
            "<li>Reklamowe – w razie wdrożenia, służą do personalizacji i mierzenia skuteczności reklam.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">3. Cel i podstawa prawna</h2>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Zapewnienie działania i bezpieczeństwa serwisu – nasz prawnie uzasadniony interes.</li>" +
            "<li>Poprawa jakości i personalizacja – Twoja zgoda (jeśli wymagana).</li>" +
            "<li>Statystyka i analiza – nasz uzasadniony interes lub zgoda, w zależności od zakresu.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">4. Zarządzanie zgodą i wyłączenie cookies</h2>" +
            "<p class=\"text-gray-700 mb-2\">W każdej chwili możesz zmienić swoje preferencje dotyczące cookies w ustawieniach przeglądarki lub w naszym module zarządzania zgodą.</p>" +
            "<ul class=\"list-disc pl-6 text-gray-700 space-y-1\">" +
            "<li>Panel zgód: przejdź do <a href=\"/ustawienia-plikow-cookies\" class=\"text-purple-700 hover:underline\">Ustawienia plików cookies</a> i dostosuj kategorie.</li>" +
            "<li>Przeglądarka: możesz blokować lub usuwać pliki cookies; pamiętaj, że wyłączenie niektórych może ograniczyć funkcjonalność serwisu.</li></ul></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">5. Cookies podmiotów trzecich</h2>" +
            "<p class=\"text-gray-700\">W serwisie mogą działać dostawcy zewnętrzni (np. narzędzia analityczne). " +
            "Pliki cookies tych podmiotów podlegają ich własnym politykom. Zalecamy zapoznanie się z zasadami prywatności odpowiednich dostawców.</p></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">6. Okres przechowywania</h2>" +
            "<p class=\"text-gray-700\">Czas przechowywania zależy od rodzaju pliku: sesyjne są usuwane po zamknięciu przeglądarki, " +
            "stałe pozostają na urządzeniu do czasu ich wygaśnięcia lub ręcznego usunięcia.</p></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">7. Zmiany Polityki cookies</h2>" +
            "<p class=\"text-gray-700\">Możemy aktualizować niniejszą Politykę, aby odzwierciedlała zmiany w technologii, przepisach lub usługach. " +
            "O istotnych zmianach poinformujemy w serwisie.</p></section>" +
            "<section><h2 class=\"text-xl font-semibold text-gray-900 mb-2\">8. Kontakt</h2>" +
            "<p class=\"text-gray-700\">W sprawach dotyczących cookies i prywatności skontaktuj się z nami poprzez formularz dostępny w serwisie " +
            "lub dane podane w sekcji \"Kontakt\".</p></section>");
        
        
           
    }

    private void createDefaultPageIfNotExists(String slug, String title, String content) {
        if (!contentPageRepository.existsBySlug(slug)) {
            ContentPage page = new ContentPage(slug, title, content);
            contentPageRepository.save(page);
        }
    }
}
