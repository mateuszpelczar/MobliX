# Dane osobowe użytkowników platformy MobliX

## Przegląd

Platforma MobliX to serwis ogłoszeniowy do sprzedaży smartphonów. W ramach funkcjonalności platformy, użytkownicy mogą udostępniać następujące rodzaje danych osobowych:

## 1. Dane uwierzytelniające (wymagane)
- **Nazwa użytkownika** - unikalny identyfikator użytkownika w systemie
- **Adres email** - używany do logowania i komunikacji z platformą
- **Hasło** - zabezpieczone hashowaniem, używane do uwierzytelniania

## 2. Dane kontaktowe (opcjonalne)
- **Imię i nazwisko** - do identyfikacji w transakcjach
- **Numer telefonu** - alternatywny sposób kontaktu
- **Adres zamieszkania:**
  - Ulica i numer
  - Miasto
  - Kod pocztowy
  - Kraj

## 3. Dane demograficzne (opcjonalne)
- **Data urodzenia** - do weryfikacji wieku (18+) przy pewnych transakcjach

## 4. Dane firmowe (opcjonalne)
- **Nazwa firmy** - dla sprzedawców prowadzących działalność gospodarczą
- **NIP (Tax ID)** - numer identyfikacji podatkowej

## 5. Ustawienia prywatności i preferencji
- **Publiczny profil** - czy podstawowe informacje mogą być widoczne dla innych użytkowników
- **Wyświetlanie kontaktu w ogłoszeniach** - czy dane kontaktowe będą pokazywane w ogłoszeniach
- **Preferowany sposób kontaktu** - email lub telefon
- **Subskrypcja newslettera** - zgoda na otrzymywanie informacji marketingowych

## 6. Dane aktywności (automatycznie generowane)
- **Data utworzenia konta**
- **Data ostatniej aktualizacji profilu**
- **Historia ogłoszeń** - utworzone ogłoszenia
- **Historia transakcji** - zakupy i sprzedaże
- **Ulubione ogłoszenia**
- **Recenzje i oceny**
- **Wiadomości prywatne**
- **Logi aktywności**

## Przetwarzanie i ochrona danych

### Podstawy prawne przetwarzania:
1. **Wykonanie umowy** - dla danych niezbędnych do świadczenia usług
2. **Zgoda** - dla danych opcjonalnych i marketingu
3. **Prawnie uzasadniony interes** - dla bezpieczeństwa i zapobiegania nadużyciom

### Środki bezpieczeństwa:
- Hashowanie haseł (BCrypt)
- Autoryzacja poprzez JWT tokens
- Walidacja danych wejściowych
- HTTPS dla wszystkich połączeń
- Kontrola dostępu oparta na rolach

### Prawa użytkowników (RODO):
- **Dostęp** - przeglądanie własnych danych w profilu
- **Sprostowanie** - edycja danych w profilu  
- **Usunięcie** - możliwość usunięcia konta
- **Przenoszenie** - eksport danych w formacie JSON
- **Ograniczenie przetwarzania** - ustawienia prywatności
- **Sprzeciw** - rezygnacja z newslettera i marketingu

## Wykorzystanie danych

### Dane wykorzystywane do:
1. **Świadczenia usług** - tworzenie ogłoszeń, komunikacja między użytkownikami
2. **Bezpieczeństwa** - wykrywanie nadużyć, moderacja treści
3. **Poprawy jakości** - analiza aktywności, feedback
4. **Komunikacji** - powiadomienia o statusie ogłoszeń, wiadomościach
5. **Marketingu** - newsletter, personalizowane oferty (za zgodą)

### Udostępnianie danych:
- **Innym użytkownikom** - tylko dane oznaczone jako publiczne
- **Podmiotom trzecim** - tylko za zgodą lub wymogiem prawnym
- **Organom państwowym** - na żądanie uprawnionych instytucji

## Implementacja techniczna

### Backend (Spring Boot + JPA):
- Model `User` z dodatkowymi polami dla danych osobowych
- DTOs dla bezpiecznego transferu danych
- Service layer z logiką biznesową
- REST API endpoints dla zarządzania profilem

### Frontend (React + TypeScript):
- Komponent `UserProfile` do zarządzania danymi
- Formularze z walidacją
- Responsywny interfejs
- Integracja z API poprzez Axios

### Baza danych:
- Tabela `users` z rozszerzonymi polami
- Indeksy na pola wyszukiwania
- Constrainty dla integralności danych
- Automatyczne timestamping

## Zgodność z przepisami

Implementacja uwzględnia wymagania:
- **RODO** (General Data Protection Regulation)
- **Polskiego prawa telekomunikacyjnego**
- **Ustawy o ochronie danych osobowych**
- **Kodeksu cywilnego** w zakresie umów elektronicznych

## Podsumowanie

Platforma MobliX zbiera minimalne dane niezbędne do działania oraz opcjonalne dane dla poprawy doświadczeń użytkownika. Wszystkie dane są chronione zgodnie z najlepszymi praktykami bezpieczeństwa i przepisami prawa.