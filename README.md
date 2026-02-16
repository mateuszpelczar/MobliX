# 📱 MobliX — Platforma ogłoszeń smartfonów

MobliX to internetowa platforma ogłoszeniowa specjalizująca się w sprzedaży smartfonów. System umożliwia użytkownikom przeglądanie, dodawanie i zarządzanie ogłoszeniami, a także komunikację między kupującymi a sprzedającymi.

> **Projekt inżynierski** — aplikacja fullstack zbudowana w oparciu o architekturę REST API z wyraźnym podziałem na backend (Java/Spring Boot) i frontend (React/TypeScript).

---

## 🌐 Demo

| Warstwa | URL |
|---|---|
| **Frontend** | [mobli-x.vercel.app](https://mobli-x.vercel.app) |
| **Backend API** | [moblix.onrender.com](https://moblix.onrender.com) |

> ⚠️ Backend na darmowym planie Render może usypiać po 15 min nieaktywności — pierwsze załadowanie może potrwać ~30s.

---

## 🛠️ Stos technologiczny

### Backend
| Technologia | Wersja | Opis |
|---|---|---|
| **Java** | 21 | Język programowania |
| **Spring Boot** | 3.5.3 | Framework aplikacji |
| **Spring Security** | — | Uwierzytelnianie i autoryzacja (JWT) |
| **Spring Data JPA** | — | Warstwa dostępu do danych (Hibernate) |
| **PostgreSQL** | — | Relacyjna baza danych (hosting: Aiven.io) |
| **Flyway** | — | Migracje bazy danych |
| **AWS Rekognition** | SDK 2.21.0 | Moderacja treści obrazów |
| **AWS Comprehend** | SDK 2.21.0 | Moderacja treści tekstowych |
| **Maven** | — | Zarządzanie zależnościami i budowanie projektu |

### Frontend
| Technologia | Wersja | Opis |
|---|---|---|
| **React** | 19.1 | Biblioteka UI |
| **TypeScript** | 5.8 | Typowany JavaScript |
| **Vite** | 7.0 | Narzędzie do budowania i dev server |
| **React Router** | 7.6 | Routing po stronie klienta |
| **Axios** | 1.10 | Komunikacja HTTP z backend API |
| **Lucide React** | — | Biblioteka ikon |

### Infrastruktura
| Usługa | Przeznaczenie |
|---|---|
| **Vercel** | Hosting frontendu |
| **Render** | Hosting backendu (Docker) |
| **Aiven.io** | Hosting bazy danych PostgreSQL |
| **Gmail SMTP** | Wysyłka emaili (reset hasła) |

---

## ✨ Funkcjonalności

### Użytkownik
- 🔐 Rejestracja i logowanie (konto osobiste / firmowe)
- 📝 Dodawanie, edycja i usuwanie ogłoszeń
- 📸 Upload wielu zdjęć do ogłoszenia
- 🔍 Wyszukiwanie z podpowiedziami (Full-Text Search PostgreSQL)
- ⭐ Obserwowanie ogłoszeń (ulubione)
- 💬 System wiadomości między użytkownikami
- 🔔 Powiadomienia (zmiana ceny, statusu ogłoszenia itp.)
- 🔑 Reset hasła przez email

### Moderacja (rola STAFF)
- ✅ Zatwierdzanie / odrzucanie ogłoszeń
- 👤 Zarządzanie użytkownikami (blokowanie, przeglądanie aktywności)
- 📊 Statystyki i raporty moderacyjne
- 🚩 Obsługa zgłoszeń ogłoszeń

### Administracja (rola ADMIN)
- 👥 Zarządzanie rolami użytkowników
- 📋 Logi systemowe
- 📈 Dashboard ze statystykami
- 📄 Zarządzanie treściami statycznymi (regulamin, polityka cookies)
- 📊 Statystyki wyszukiwań i raportów

### Bezpieczeństwo
- 🛡️ Uwierzytelnianie JWT (JSON Web Token)
- 🔒 Autoryzacja oparta na rolach (USER, STAFF, ADMIN)
- 🤖 Automatyczna moderacja treści (AWS Rekognition + Comprehend)
- 🔐 Szyfrowanie haseł (BCrypt)
- 🛡️ Ochrona przed SQL Injection (parametryzowane zapytania)
- 🌐 Konfiguracja CORS

---

## 📁 Struktura projektu

```
MobliX/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/example/backend/
│   │   ├── config/                   # Konfiguracja (Security, CORS, Web)
│   │   ├── controller/               # Kontrolery REST (14 plików)
│   │   ├── dto/                      # Data Transfer Objects (16 plików)
│   │   ├── model/                    # Encje JPA (20 plików)
│   │   ├── repository/               # Repozytoria Spring Data (20 plików)
│   │   ├── security/                 # JWT Filter, konfiguracja
│   │   ├── service/                  # Logika biznesowa (19 plików)
│   │   └── others/                   # Klasy pomocnicze
│   ├── src/main/resources/
│   │   ├── application.properties    # Konfiguracja aplikacji
│   │   └── db/migration/             # Migracje Flyway (10 plików)
│   ├── dockerfile                    # Konfiguracja Docker dla Render
│   └── pom.xml                       # Zależności Maven
│
├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── auth/                     # Logowanie, rejestracja, reset hasła
│   │   ├── components/
│   │   │   ├── admin/                # Panel administratora
│   │   │   ├── staff/                # Panel moderatora
│   │   │   ├── user/                 # Panel użytkownika
│   │   │   └── overall/              # Komponenty ogólne (katalog, szczegóły)
│   │   ├── services/                 # Serwisy API (wyszukiwanie)
│   │   ├── routes/                   # Routing i zabezpieczenia tras
│   │   └── styles/                   # Arkusze stylów CSS
│   ├── vite.config.ts                # Konfiguracja Vite
│   └── package.json                  # Zależności npm
│
└── README.md
```

---

## 🚀 Uruchomienie lokalne

### Wymagania
- **Java 21** (JDK)
- **Node.js** 18+ i **npm**
- **PostgreSQL** (lub połączenie z zewnętrzną bazą, np. Aiven)
- **Maven** (lub użyj wbudowanego wrappera `mvnw`)

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/mateuszpelczar/MobliX.git
cd MobliX
```

### 2. Konfiguracja backendu

Utwórz plik `backend/.env` z wymaganymi zmiennymi środowiskowymi:

```env
# Database
DB_URL=jdbc:postgresql://HOST:PORT/DATABASE?sslmode=require
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# SMTP (opcjonalnie — do wysyłki emaili)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# Frontend URL (do linków w emailach)
FRONTEND_URL=http://localhost:5177

# AWS Content Moderation (opcjonalnie)
AWS_MODERATION_ENABLED=false
```

### 3. Uruchomienie backendu

```bash
cd backend
.\mvnw spring-boot:run
```

Backend wystartuje na `http://localhost:8080`.

### 4. Uruchomienie frontendu

```bash
cd frontend
npm install
npm run dev
```

Frontend wystartuje na `http://localhost:5177`.

### 5. Otwórz aplikację

Przejdź do [http://localhost:5177](http://localhost:5177) w przeglądarce.

---

## 📡 API Endpoints

### Publiczne
| Metoda | Endpoint | Opis |
|---|---|---|
| `POST` | `/api/auth/register` | Rejestracja użytkownika |
| `POST` | `/api/auth/login` | Logowanie |
| `GET` | `/api/advertisements/latest` | Najnowsze ogłoszenia |
| `GET` | `/api/advertisements/{id}` | Szczegóły ogłoszenia |
| `GET` | `/api/search/**` | Wyszukiwanie z podpowiedziami |

### Wymagające autoryzacji (JWT)
| Metoda | Endpoint | Opis |
|---|---|---|
| `POST` | `/api/advertisements` | Dodaj ogłoszenie |
| `PUT` | `/api/advertisements/{id}` | Edytuj ogłoszenie |
| `DELETE` | `/api/advertisements/{id}` | Usuń ogłoszenie |
| `GET` | `/api/favorites` | Lista obserwowanych |
| `GET` | `/api/messages/**` | Wiadomości |
| `GET` | `/api/notifications` | Powiadomienia |

### Panel administracyjny (ADMIN)
| Metoda | Endpoint | Opis |
|---|---|---|
| `GET` | `/api/admin/users` | Lista użytkowników |
| `PUT` | `/api/admin/users/{id}/role` | Zmiana roli |
| `GET` | `/api/admin/stats/dashboard` | Statystyki |
| `GET` | `/api/logs` | Logi systemowe |

---

## 🏗️ Architektura

```
┌─────────────┐     REST API      ┌──────────────────┐     JPA/JDBC     ┌────────────┐
│   Frontend   │ ──────────────── │     Backend      │ ──────────────── │ PostgreSQL │
│  React/TS    │    HTTP/JSON     │  Spring Boot     │                  │  (Aiven)   │
│  (Vercel)    │                  │  (Render/Docker) │                  └────────────┘
└─────────────┘                   │                  │
                                  │  ┌────────────┐  │
                                  │  │ Spring     │  │
                                  │  │ Security   │  │
                                  │  │ (JWT)      │  │
                                  │  └────────────┘  │
                                  │                  │
                                  │  ┌────────────┐  │
                                  │  │ AWS        │  │
                                  │  │ Rekognition│  │
                                  │  │ Comprehend │  │
                                  │  └────────────┘  │
                                  └──────────────────┘
```

---

## 👨‍💻 Autor

**Mateusz Pelczar** — Projekt inżynierski

---

## 📝 Licencja

Ten projekt został stworzony w ramach pracy inżynierskiej. Wszelkie prawa zastrzeżone.
