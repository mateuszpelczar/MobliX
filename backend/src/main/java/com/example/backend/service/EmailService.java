package com.example.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.from:zespol@moblix.com}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            log.info("Rozpoczynanie wysylki emaila resetujacego haslo na: {}", toEmail);
            log.info("SMTP config - from: {}, frontendUrl: {}", fromEmail, frontendUrl);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("MobliX - Resetowanie hasła");

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            String htmlContent = buildPasswordResetEmailHtml(resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Wiadomość e-mail dotycząca resetowania hasła została pomyślnie wysłana na adres: {}", toEmail);
        } catch (Exception e) {
            log.error("BLAD WYSYLKI EMAILA na adres: {} - Typ: {} - Wiadomosc: {}", toEmail, e.getClass().getName(), e.getMessage(), e);
        }
    }

    private String buildPasswordResetEmailHtml(String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Resetowanie hasła</h1>
                    </div>
                    <div class="content">
                        <p>Witaj,</p>
                        <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w MobliX.</p>
                        <p>Kliknij poniższy przycisk, aby ustawić nowe hasło:</p>
                        <div style="text-align: center;">
                            <a href="%s" class="button">Zresetuj hasło</a>
                        </div>
                        <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
                        <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">
                            %s
                        </p>
                        <div class="warning">
                            <strong>⚠️ Ważne informacje bezpieczeństwa:</strong>
                            <ul>
                                <li>Link jest ważny przez <strong>1 godzinę</strong></li>
                                <li>Możesz użyć go tylko <strong>jeden raz</strong></li>
                                <li>Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość</li>
                                <li>Nigdy nie udostępniaj tego linku innym osobom</li>
                            </ul>
                        </div>
                        <p>Jeśli masz problemy z resetowaniem hasła, skontaktuj się z naszym zespołem wsparcia.</p>
                        <p>Pozdrawiamy,<br><strong>Zespół MobliX</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 MobliX. Wszystkie prawa zastrzeżone.</p>
                        <p>Ta wiadomość została wysłana automatycznie. Proszę nie odpowiadaj na ten email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetLink, resetLink);
    }
}