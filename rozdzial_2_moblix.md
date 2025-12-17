# 2. Analiza i projekt systemu MobliX

## 2.1. Analiza tematu i konkurencji

W ostatnich latach obserwujemy wyraźny wzrost zainteresowania rynkiem wtórnym elektroniki użytkowej, w szczególności smartfonami. Coraz więcej konsumentów poszukuje urządzeń używanych jako alternatywy dla drogich premier, podczas gdy właściciele starszych modeli szukają sprawdzonych kanałów sprzedaży. Mimo rosnącego popytu, polskie platformy ogłoszeniowe wciąż nie oferują narzędzi dopasowanych do specyfiki tego segmentu rynku.

### Przegląd istniejących rozwiązań

Wśród dominujących graczy na polskim rynku można wymienić dwie główne platformy o charakterze ogólnosprzedażowym.

**OLX.pl** to największy serwis ogłoszeniowy w kraju, gromadzący oferty z niemal każdej kategorii produktowej. Zakres działalności tego portalu sprawia jednak, że sekcja poświęcona telefonom komórkowym bywa chaotyczna. Urządzenia mobilne mieszają się z akcesoriami, a brak wyspecjalizowanych filtrów technicznych utrudnia znalezienie konkretnego modelu o pożądanych parametrach. System moderacji treści opiera się głównie na zgłoszeniach społeczności, co może prowadzić do opóźnień w usuwaniu nieodpowiednich materiałów.

**Allegro Lokalnie** stanowi próbę stworzenia konkurencji dla OLX, jednak boryka się z podobnymi ograniczeniami. Uniwersalny charakter serwisu nie sprzyja precyzyjnemu wyszukiwaniu urządzeń po specyfikacji technicznej, a mechanizmy kontroli jakości treści pozostają reaktywne zamiast proaktywnych.

### Propozycja wartości systemu MobliX

Platforma MobliX została zaprojektowana jako wyspecjalizowany serwis ogłoszeniowy dedykowany wyłącznie smartfonom. Takie zawężenie zakresu działalności umożliwia wdrożenie rozwiązań niedostępnych w serwisach uniwersalnych:

Po pierwsze, system oferuje zaawansowane filtrowanie według parametrów technicznych. Użytkownik może wyszukiwać urządzenia nie tylko po marce i modelu, lecz również według pojemności pamięci masowej, wielkości RAM, rozmiaru wyświetlacza czy dostępności funkcji szybkiego ładowania.

Po drugie, platforma wykorzystuje mechanizmy sztucznej inteligencji do automatycznej weryfikacji treści. Zdjęcia dodawane do ogłoszeń są analizowane pod kątem obecności materiałów nieodpowiednich, a teksty opisów sprawdzane w poszukiwaniu wyrażeń wulgarnych lub obraźliwych. Proces ten odbywa się przed publikacją, co eliminuje potrzebę oczekiwania na reakcję moderatorów.

Po trzecie, wbudowany system podpowiedzi wyszukiwania przyspiesza nawigację. Już po wpisaniu pierwszych liter zapytania użytkownik otrzymuje propozycje dopasowanych marek i modeli, co znacznie skraca czas potrzebny na odnalezienie interesującej oferty.

Po czwarte, korzystanie z platformy pozostaje bezpłatne zarówno dla kupujących, jak i wystawiających ogłoszenia.

---

## 2.2. Założenia projektowe

Niniejszy podrozdział prezentuje wykaz wymagań stawianych przed systemem MobliX. Wymagania podzielono na dwie kategorie: funkcjonalne, opisujące konkretne działania możliwe do wykonania przez użytkowników, oraz niefunkcjonalne, określające cechy jakościowe całego rozwiązania.

### 2.2.1. Wymagania funkcjonalne

Poniższa lista przedstawia kluczowe funkcje systemu pogrupowane według obszarów tematycznych.

**Obszar autoryzacji i zarządzania kontem:**
- Założenie nowego konta użytkownika z wyborem typu (osoba prywatna lub działalność gospodarcza)
- Uwierzytelnianie za pomocą adresu elektronicznego i hasła
- Procedura odzyskiwania zapomnianego hasła poprzez wiadomość e-mail
- Zakończenie sesji użytkownika

**Obszar zarządzania ogłoszeniami:**
- Tworzenie nowego ogłoszenia wraz z opisem parametrów technicznych smartfona
- Modyfikacja opublikowanych ofert
- Wycofanie ogłoszenia z publikacji
- Dołączanie fotografii urządzenia (maksymalnie pięć sztuk)
- Automatyczna weryfikacja treści i materiałów graficznych podczas publikacji

**Obszar przeglądania i wyszukiwania:**
- Wyświetlanie katalogu wszystkich dostępnych urządzeń
- Filtrowanie wyników według wybranych kryteriów
- Podpowiedzi wyszukiwania działające w czasie rzeczywistym
- Podgląd szczegółowych informacji o ofercie

**Obszar interakcji użytkowników:**
- Dodawanie ofert do listy obserwowanych
- Wymiana wiadomości prywatnych między zainteresowanymi stronami
- Otrzymywanie powiadomień o istotnych zdarzeniach

**Obszar administracyjny:**
- Zarządzanie uprawnieniami użytkowników
- Tymczasowa lub stała blokada kont naruszających regulamin
- Przegląd historii działań systemowych
- Generowanie zbiorczych statystyk
- Edycja treści informacyjnych portalu

**Obszar moderacji:**
- Przeglądanie ogłoszeń oczekujących na akceptację
- Rozpatrywanie zgłoszeń naruszeń od użytkowników
- Interwencyjna edycja lub usunięcie problematycznych ofert

### 2.2.2. Wymagania niefunkcjonalne

Oprócz konkretnych funkcji, system musi spełniać szereg wymogów jakościowych.

**Bezpieczeństwo danych:** Hasła użytkowników przechowywane są w postaci zaszyfrowanej z wykorzystaniem algorytmu BCrypt. Sesje autoryzowane są przy pomocy tokenów JWT, co eliminuje konieczność przechowywania stanu sesji po stronie serwera. Wszystkie dane wejściowe podlegają walidacji zarówno w warstwie prezentacji, jak i logiki biznesowej.

**Wydajność i responsywność:** Typowe operacje powinny otrzymywać odpowiedź serwera w czasie nieprzekraczającym pół sekundy. Podpowiedzi wyszukiwania muszą pojawiać się niemal natychmiastowo, bez zauważalnego opóźnienia podczas pisania.

**Dostosowanie do urządzeń mobilnych:** Interfejs użytkownika automatycznie adaptuje się do rozmiaru ekranu, zapewniając wygodę obsługi zarówno na komputerach stacjonarnych, jak i telefonach czy tabletach.

**Dostępność usługi:** Platforma powinna działać nieprzerwanie przez całą dobę. Architektura systemu przewiduje mechanizmy automatycznego wznawiania pracy w przypadku awarii.

**Ergonomia:** Interfejs zaprojektowano z myślą o intuicyjnej obsłudze bez konieczności zapoznawania się z dokumentacją. Komunikaty systemowe formułowane są w języku polskim, w sposób zrozumiały dla przeciętnego użytkownika.

---

## 2.3. Charakterystyka technologii

### 2.3.1. Warstwa prezentacji: React z TypeScript

Do budowy interfejsu użytkownika wykorzystano bibliotekę React w połączeniu z językiem TypeScript. Wybór ten podyktowany był kilkoma istotnymi względami praktycznymi.

React opiera się na koncepcji komponentów – samodzielnych bloków interfejsu, które można dowolnie łączyć i ponownie wykorzystywać. Taka organizacja kodu znacząco ułatwia rozwój aplikacji o złożonej strukturze ekranów. W przypadku MobliX wyodrębniono osobne komponenty dla panelu głównego, widoku szczegółów ogłoszenia, formularza dodawania oferty czy paska wyszukiwania z podpowiedziami.

TypeScript uzupełnia JavaScript o system typów weryfikowany podczas kompilacji. Dzięki temu wiele potencjalnych błędów wykrywanych jest jeszcze przed uruchomieniem aplikacji, co ma szczególne znaczenie przy projektach angażujących dziesiątki plików źródłowych.

Dodatkowo React dysponuje rozbudowanym ekosystemem bibliotek pomocniczych. Do obsługi nawigacji między podstronami bez przeładowania dokumentu wykorzystano pakiet react-router-dom, który umożliwia deklaratywne definiowanie ścieżek i przypisanych im widoków.

### 2.3.2. Warstwa logiki biznesowej: Java ze Spring Boot

Serwerową część aplikacji zaimplementowano w języku Java przy wykorzystaniu platformy Spring Boot. Połączenie to cieszy się uznaniem w środowisku korporacyjnym ze względu na stabilność i bogactwo dostępnych rozwiązań.

Spring Boot eliminuje znaczną część konfiguracji wymaganej przy tworzeniu aplikacji webowych. Mechanizm automatycznego wstrzykiwania zależności oraz konwencja nad konfiguracją pozwalają skupić się na implementacji logiki biznesowej zamiast na żmudnym zestawianiu infrastruktury technicznej.

Moduł Spring Security odpowiada za kompleksową obsługę zabezpieczeń: od generowania i weryfikacji tokenów JWT, poprzez szyfrowanie haseł algorytmem BCrypt, aż po ochronę wybranych zasobów przed nieautoryzowanym dostępem.

Integracja z bazą danych realizowana jest przy pomocy Spring Data JPA, które automatycznie mapuje klasy Java na tabele relacyjne i generuje typowe zapytania bez konieczności pisania kodu SQL.

### 2.3.3. Warstwa danych: PostgreSQL

Jako silnik bazy danych wybrano PostgreSQL – dojrzały system zarządzania relacyjnymi bazami danych o otwartym kodzie źródłowym.

Decyzja ta wynikała z analizy struktury danych w systemie MobliX. Encje takie jak użytkownicy, ogłoszenia, specyfikacje techniczne czy wiadomości pozostają w ścisłych związkach ze sobą – każde ogłoszenie przynależy do konkretnego użytkownika, posiada przypisaną lokalizację i może zawierać wiele fotografii. Model relacyjny idealnie oddaje tego typu powiązania.

PostgreSQL oferuje również zaawansowane mechanizmy wyszukiwania tekstowego wbudowane bezpośrednio w silnik bazodanowy. W projekcie MobliX wykorzystano operator ILIKE pozwalający na dopasowywanie wzorców bez rozróżniania wielkości liter. Dzięki temu system podpowiedzi wyszukiwania działa wydajnie bez konieczności wdrażania zewnętrznych usług indeksujących.

### 2.3.4. Usługi chmurowe Amazon Web Services

Platforma MobliX integruje się z dwoma usługami chmurowymi firmy Amazon w celu automatyzacji procesu moderacji treści.

**Amazon Rekognition** to usługa analizy obrazu wykorzystująca techniki uczenia maszynowego. W kontekście MobliX każde zdjęcie dodawane do ogłoszenia jest przesyłane do tej usługi, która bada materiał pod kątem obecności treści nieodpowiednich: nagości, przemocy, symboli nienawiści czy narkotyków. Gdy usługa wykryje problematyczny materiał z pewnością przekraczającą ustalony próg, ogłoszenie zostaje automatycznie odrzucone wraz z informacją o przyczynie.

**Amazon Comprehend** służy do analizy tekstu w języku naturalnym. Usługa bada wydźwięk emocjonalny opisów ogłoszeń i wykrywa potencjalnie toksyczne sformułowania. Ponieważ Comprehend nie wspiera bezpośrednio języka polskiego w kontekście wykrywania wulgaryzmów, system MobliX uzupełnia tę funkcjonalność własną bazą niedozwolonych wyrażeń obejmującą kilkadziesiąt słów i fraz w języku polskim, angielskim i niemieckim.

---

## 2.4. Architektura systemu

### 2.4.1. Struktura aplikacji

System MobliX zrealizowano w architekturze trójwarstwowej uzupełnionej o integrację z usługami zewnętrznymi.

**Warstwa prezentacji** obejmuje aplikację React działającą w przeglądarce użytkownika. Kod źródłowy podzielono na moduły tematyczne: komponenty autoryzacji, panele dla różnych typów użytkowników (zwykły użytkownik, moderator, administrator) oraz widoki ogólnodostępne takie jak katalog urządzeń czy strona szczegółów oferty. Komunikacja z serwerem odbywa się wyłącznie poprzez wymianę danych w formacie JSON.

**Warstwa logiki biznesowej** zawiera aplikację Spring Boot obsługującą wszystkie operacje. Architektura wewnętrzna opiera się na wzorcu MVC: kontrolery przyjmują żądania HTTP i delegują je do odpowiednich serwisów, które realizują właściwą logikę i współpracują z repozytoriami dostępu do danych. Osobną warstwę stanowi konfiguracja zabezpieczeń oparta na Spring Security.

**Warstwa danych** to baza PostgreSQL przechowująca wszystkie trwałe informacje: dane użytkowników, treść ogłoszeń wraz ze specyfikacjami technicznymi, historię wiadomości, dzienniki zdarzeń systemowych.

**Usługi zewnętrzne** obejmują Amazon Rekognition i Comprehend do automatycznej moderacji oraz serwer SMTP Google do wysyłki wiadomości elektronicznych związanych z procedurą resetowania hasła.

### 2.4.2. Diagram architektury

Poniższy schemat przedstawia przepływ danych między poszczególnymi komponentami systemu.

```
┌─────────────────────────────────────────────────────────────────┐
│                     UŻYTKOWNIK KOŃCOWY                          │
│               (przeglądarka internetowa / telefon)              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ protokół HTTP (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│               APLIKACJA FRONTENDOWA (React + TypeScript)        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Panel       │  │  Panel       │  │  Katalog smartfonów    │ │
│  │  użytkownika │  │  moderatora  │  │  i szczegóły oferty    │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Wyszukiwarka z podpowiedziami │ Formularze │ Autoryzacja  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ żądania REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│           APLIKACJA BACKENDOWA (Java + Spring Boot)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      KONTROLERY REST                       │ │
│  │  Autoryzacja │ Ogłoszenia │ Wiadomości │ Administracja     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         SERWISY                            │ │
│  │  Użytkownicy │ Ogłoszenia │ Moderacja obrazów │ Moderacja  │ │
│  │  E-mail │ Wyszukiwanie │ Powiadomienia │ treści tekstowych │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    WARSTWA BEZPIECZEŃSTWA                  │ │
│  │       Spring Security │ JWT │ BCrypt │ Walidacja           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │              │                    │                 │
         ▼              ▼                    ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Amazon    │ │    Amazon    │ │   Serwer     │
│              │ │  Rekognition │ │  Comprehend  │ │  SMTP Google │
│  baza danych │ │  (moderacja  │ │  (moderacja  │ │  (wysyłka    │
│  relacyjna   │ │   obrazów)   │ │   tekstów)   │ │   e-maili)   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### 2.4.3. Przykład przepływu danych przy publikacji ogłoszenia

Poniżej przedstawiono sekwencję operacji wykonywanych podczas dodawania nowego ogłoszenia do systemu.

1. Użytkownik wypełnia formularz w aplikacji frontendowej, podając dane urządzenia i dołączając fotografie.

2. Aplikacja React wysyła żądanie POST do interfejsu programistycznego backendu, przekazując zebrane informacje w formacie JSON.

3. Kontroler ogłoszeń odbiera żądanie i przekazuje je do odpowiedniego serwisu biznesowego.

4. Serwis ogłoszeń inicjuje procedurę moderacji:
   - Zdjęcia przesyłane są do usługi Amazon Rekognition celem analizy wizualnej
   - Tytuł i opis trafiają do serwisu moderacji tekstowej, który wykorzystuje Amazon Comprehend oraz wewnętrzną bazę niedozwolonych wyrażeń

5. Jeżeli wszystkie materiały przejdą weryfikację pozytywnie:
   - Ogłoszenie wraz ze specyfikacją techniczną zapisywane jest w bazie PostgreSQL
   - System generuje powiadomienie dla użytkownika o pomyślnej publikacji

6. W przypadku wykrycia nieprawidłowości ogłoszenie otrzymuje status odrzuconego, a użytkownik informowany jest o przyczynie odmowy.

7. Aplikacja frontendowa odbiera odpowiedź serwera i wyświetla stosowny komunikat lub przekierowuje do widoku opublikowanej oferty.

---

## 2.5. Projekt bazy danych

### 2.5.1. Model danych

Baza danych systemu MobliX składa się z kilkunastu powiązanych encji. Poniżej opisano najistotniejsze z nich.

**Użytkownik (User)** przechowuje informacje o wszystkich zarejestrowanych osobach. Podstawowe atrybuty obejmują nazwę użytkownika, adres elektroniczny, zaszyfrowane hasło oraz przypisaną rolę w systemie. Encja obsługuje zarówno konta prywatne, jak i firmowe – w tym drugim przypadku przechowywane są dodatkowo numer NIP, REGON oraz nazwa przedsiębiorstwa. Przewidziano również pola związane z mechanizmem blokowania kont.

**Ogłoszenie (Advertisement)** stanowi centralny element modelu. Zawiera tytuł oferty, rozbudowany opis, cenę oraz status publikacji (oczekujące, aktywne, odrzucone, zakończone). W przypadku odrzucenia przechowywana jest przyczyna wraz ze znacznikiem czasowym decyzji.

**Specyfikacja smartfona (SmartphoneSpecification)** gromadzi parametry techniczne oferowanego urządzenia: producenta, nazwę modelu, kolor obudowy, wersję systemu operacyjnego, pojemność pamięci masowej i operacyjnej, parametry aparatów fotograficznych, pojemność akumulatora oraz liczne atrybuty dodatkowe jak informacja o obsłudze szybkiego ładowania czy certyfikat wodoszczelności.

**Zdjęcie (Image)** reprezentuje fotografie dołączone do ogłoszenia. Każdy rekord zawiera adres URL wskazujący lokalizację pliku na serwerze.

**Wiadomość (Message)** i **Konwersacja (Conversation)** obsługują wymianę korespondencji między użytkownikami. Konwersacja grupuje wiadomości dotyczące konkretnego ogłoszenia między dwoma stronami.

**Ulubione (FavoriteAd)** realizuje funkcję obserwowania interesujących ofert poprzez tabelę łączącą użytkowników z ogłoszeniami.

**Powiadomienie (Notification)** przechowuje komunikaty systemowe kierowane do użytkowników, takie jak informacje o nowych wiadomościach czy zmianie statusu oferty.

**Token resetowania hasła (PasswordResetToken)** obsługuje procedurę odzyskiwania dostępu do konta poprzez czasowo ważny kod weryfikacyjny.

**Zgłoszenie (AdvertisementReport)** umożliwia użytkownikom raportowanie ofert naruszających regulamin.

**Dziennik zdarzeń (Log)** rejestruje istotne operacje w systemie dla celów audytowych i diagnostycznych.

### 2.5.2. Diagram związków encji (ERD)

Poniższy diagram ilustruje strukturę bazy danych wraz z powiązaniami między tabelami.

```
┌─────────────────────┐              ┌─────────────────────┐
│       User          │              │      Category       │
├─────────────────────┤              ├─────────────────────┤
│ PK id               │              │ PK id               │
│    username         │              │    name             │
│    email            │              └──────────┬──────────┘
│    password         │                         │
│    role             │                         │ 1:N
│    accountType      │                         │
│    firstName        │                         ▼
│    lastName         │              ┌─────────────────────┐
│    companyName      │   1:N        │   Advertisement     │
│    nip              │─────────────►├─────────────────────┤
│    isBlocked        │              │ PK id               │
│    createdAt        │              │ FK user_id          │◄────┐
└─────────┬───────────┘              │ FK category_id      │     │
          │                          │ FK location_id      │     │
          │ 1:N                      │    title            │     │
          ▼                          │    description      │     │
┌─────────────────────┐              │    price            │     │
│ PasswordResetToken  │              │    status           │     │
├─────────────────────┤              │    createdAt        │     │
│ PK id               │              └─────────┬───────────┘     │
│ FK user_id          │                        │                 │
│    token            │                        │ 1:1             │
│    expiryDate       │                        ▼                 │
│    used             │              ┌─────────────────────────┐ │
└─────────────────────┘              │ SmartphoneSpecification │ │
                                     ├─────────────────────────┤ │
┌─────────────────────┐              │ PK id                   │ │
│      Location       │   1:N        │ FK advertisement_id     │ │
├─────────────────────┤─────────────►│    brand                │ │
│ PK id               │              │    model                │ │
│    city             │              │    storage              │ │
│    region           │              │    ram                  │ │
└─────────────────────┘              │    batteryCapacity      │ │
                                     │    ... (dalsze pola)    │ │
                                     └─────────────────────────┘ │
                                                                 │
┌─────────────────────┐              ┌─────────────────────┐    │
│       Image         │              │     FavoriteAd      │    │
├─────────────────────┤              ├─────────────────────┤    │
│ PK id               │◄─────────────│ FK advertisement_id │────┘
│ FK advertisement_id │     N:1      │ FK user_id          │
│    url              │              │ PK id               │
└─────────────────────┘              └─────────────────────┘

┌─────────────────────┐              ┌─────────────────────┐
│     Conversation    │    1:N       │      Message        │
├─────────────────────┤─────────────►├─────────────────────┤
│ PK id               │              │ PK id               │
│ FK participant1_id  │              │ FK conversation_id  │
│ FK participant2_id  │              │ FK sender_id        │
│ FK advertisement_id │              │    content          │
│    lastMessageAt    │              │    isRead           │
└─────────────────────┘              │    createdAt        │
                                     └─────────────────────┘

┌─────────────────────┐              ┌──────────────────────────┐
│    Notification     │              │   AdvertisementReport    │
├─────────────────────┤              ├──────────────────────────┤
│ PK id               │              │ PK id                    │
│ FK user_id          │              │ FK advertisement_id      │
│    type             │              │ FK reporter_id           │
│    message          │              │    reason                │
│    isRead           │              │    status                │
│    createdAt        │              │    createdAt             │
└─────────────────────┘              └──────────────────────────┘

┌─────────────────────┐
│        Log          │
├─────────────────────┤
│ PK id               │
│ FK user_id          │
│    action           │
│    details          │
│    createdAt        │
└─────────────────────┘
```

### Podsumowanie kluczowych związków

Między encjami zachodzą następujące relacje:

- Jeden użytkownik może opublikować wiele ogłoszeń (relacja jeden do wielu)
- Każde ogłoszenie posiada dokładnie jedną specyfikację techniczną (relacja jeden do jednego)
- Do ogłoszenia można dołączyć maksymalnie pięć fotografii (relacja jeden do wielu)
- Użytkownicy mogą obserwować dowolną liczbę ofert (relacja wiele do wielu realizowana przez tabelę pośredniczącą FavoriteAd)
- Konwersacja grupuje wiele wiadomości dotyczących tego samego ogłoszenia między dwoma uczestnikami

---

*Opracowano na podstawie dokumentacji projektowej i analizy kodu źródłowego systemu MobliX*
