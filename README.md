# MobliX

MobliX is a full-stack web marketplace for buying and selling smartphones. Users can post and browse listings, message sellers, report content, and save favourites. The platform includes a moderation layer (STAFF role) and a full administration panel (ADMIN role) with analytics, user management, and system logs.

The application is written in Polish.

---

## Features

- **Listings** — create, edit, delete, and browse smartphone advertisements with detailed specifications and photos
- **Search** — full-text search with fuzzy matching, search suggestions, and search analytics
- **Messaging** — user-to-user conversations tied to listings
- **Notifications** — in-app notifications for messages, moderation decisions, and system events
- **Favourites** — save and revisit listings
- **Content moderation** — automated image and text moderation via AWS (currently disabled — see note below); manual review queue for STAFF
- **Reporting** — users can report inappropriate listings
- **User management** — ADMIN can change roles, block/unblock accounts
- **Admin dashboard** — site statistics, audit logs, search logs, CMS pages
- **Email notifications** — account confirmation, password reset, listing status updates
- **Password reset** — token-based flow with rate limiting (3 attempts, 15-min lockout)

---

## Architecture & Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.1.0 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 7.0.0 | Build tool & dev server (port 5177) |
| React Router | v7 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Axios | 1.10.0 | HTTP client |
| jwt-decode | 4.0.0 | Client-side token inspection |

The frontend is a Single-Page Application. All `/api`, `/uploads`, and `/images` requests are proxied to the backend during development via `vite.config.ts`.

Route protection is handled in `src/routes/PrivateRoutes.tsx`. Components are split by role under `src/components/`: `admin/`, `staff/`, `user/`, and `overall/` (public pages).

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.5.3 | Application framework |
| Java | 21 | Language |
| Maven | 3 | Build tool |
| Spring Security | — | Authentication & authorisation |
| jjwt | 0.11.5 | JWT generation & validation |
| Spring Data JPA / Hibernate | — | ORM |
| Flyway | — | Database migrations |
| Spring Mail | — | Email via SMTP |
| Google Guava | — | Rate limiting |
| AWS SDK | — | Rekognition, Comprehend |

The backend follows a layered architecture: **Controller → Service → Repository**.

| Layer | Package |
|---|---|
| REST endpoints | `controller/` |
| Business logic | `service/` |
| Data access | `repository/` |
| JPA entities | `model/` |
| DTOs | `dto/` |
| Security filters | `security/` |
| Spring config | `config/` |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary datastore |
| Flyway | Schema versioning (migrations V3–V15) |
| `pg_trgm` extension | Fuzzy / trigram search |
| `tsvector` + GIN indexes | Full-text search on listings |

Key tables: `users`, `ogloszenia` (listings), `smartphone_specifications`, `messages`, `notifications`, `logs`, `search_logs`, `categories`, `advertisement_reports`, `content_pages`.

### External Services

| Service | Purpose |
|---|---|
| AWS Rekognition | Automated image content moderation |
| AWS Comprehend | Automated text content moderation |
| Gmail SMTP (SSL, port 465) | Transactional email |
| AWS OpenSearch (optional) | Enhanced search |

> **Note: AWS moderation is currently disabled.** Automated image moderation (Rekognition) and text moderation (Comprehend) have been turned off due to rising cloud costs. Content moderation is handled manually by STAFF through the moderation queue. To re-enable, set `AWS_MODERATION_ENABLED=true` in `backend/.env` and provide valid AWS credentials.

---

## Running Locally

### Prerequisites

- **Java 21** JDK
- **Node.js 18+** and npm
- **PostgreSQL 13+** running locally (or a remote instance)
- Maven wrapper is included — no separate Maven install needed

### 1. Clone the repository

```bash
git clone <repository-url>
cd MobliX
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values (see [Configuration](#configuration) below).

### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The server starts on **http://localhost:8080**. Flyway will automatically run any pending migrations on startup.

### 4. Configure the frontend

```bash
cp frontend/.env.example frontend/.env   # or create manually
```

`frontend/.env` needs one variable:

```env
VITE_API_URL=http://localhost:8080
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5177**.

---

## Configuration

All backend configuration is loaded from `backend/.env`. Copy `backend/.env.example` as a starting point.

```env
# ── Database ──────────────────────────────────────────────────────────────────
DB_URL=jdbc:postgresql://localhost:5432/moblix
DB_USERNAME=your_username
DB_PASSWORD=your_password

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=your_long_random_secret
JWT_EXPIRATION=86400000        # 24 hours in ms

# ── Email (Gmail SMTP) ────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465                  # SSL — do NOT use 587 (STARTTLS blocked on Render)
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password   # Use a Gmail App Password, not your account password

# ── Password reset ────────────────────────────────────────────────────────────
PASSWORD_RESET_TOKEN_EXPIRATION=3600000   # 1 hour
PASSWORD_RESET_MAX_ATTEMPTS=3
PASSWORD_RESET_LOCKOUT_DURATION=900000    # 15 minutes

# ── Frontend URL (for email links) ────────────────────────────────────────────
FRONTEND_URL=http://localhost:5177

# ── AWS Content Moderation ───────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_MODERATION_REGION=eu-central-1
AWS_MODERATION_ENABLED=false    # Currently disabled — set to true to re-enable
AWS_REKOGNITION_MIN_CONFIDENCE=75.0
AWS_COMPREHEND_MIN_CONFIDENCE=0.7

# ── AWS Cognito (optional) ────────────────────────────────────────────────────
AWS_COGNITO_REGION=eu-central-1
AWS_COGNITO_USER_POOL_ID=your_user_pool_id
AWS_COGNITO_CLIENT_ID=your_client_id

# ── OpenSearch (optional) ─────────────────────────────────────────────────────
OPENSEARCH_ENABLED=false
OPENSEARCH_HOST=your-opensearch-host.es.amazonaws.com
OPENSEARCH_PORT=443
```

> **AWS moderation** is currently disabled (`AWS_MODERATION_ENABLED=false`). When disabled, listings skip automated moderation and are reviewed manually by STAFF. To enable, set it to `true` and supply valid AWS credentials.

> **OpenSearch** is optional. When `OPENSEARCH_ENABLED=false`, search falls back to native PostgreSQL full-text search.

---

## Application Access

| URL | Description |
|---|---|
| http://localhost:5177 | Frontend (main app) |
| http://localhost:8080 | Backend API |
| http://localhost:8080/api/auth/login | Auth endpoint |

After logging in, the navigation adapts to the user's role:

| Role | Access |
|---|---|
| `USER` | Browse listings, create/edit own ads, messaging, favourites, notifications |
| `STAFF` | Everything USER can do + moderation queue, approve/reject listings and reports |
| `ADMIN` | Everything STAFF can do + user management, role assignment, system logs, analytics, CMS |

---

## Default Accounts

There are no seeded default accounts. The database migrations only create the schema and default CMS content pages — no user records are inserted.

### Creating the first admin

1. Register a new account through the frontend at http://localhost:5177
2. Connect to your PostgreSQL database and run:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your_email@example.com';
```

3. Log in — the admin panel will be accessible from the navigation.

> Subsequent role changes (USER ↔ STAFF ↔ ADMIN) can be done through the admin panel UI without direct database access.

<img width="1563" height="856" alt="image" src="https://github.com/user-attachments/assets/1ae83e59-2714-4932-8f15-144f24e5ae46" />
<img width="1451" height="912" alt="image" src="https://github.com/user-attachments/assets/390b1931-348e-4707-a468-d3ba84c905c1" />
<img width="1410" height="847" alt="image" src="https://github.com/user-attachments/assets/e7ecb572-e03c-4d11-9b3d-3d64f20c66c9" />
<img width="1018" height="778" alt="image" src="https://github.com/user-attachments/assets/cea046d0-ae9b-4c6d-a25e-00c14e54ff62" />
<img width="1414" height="875" alt="image" src="https://github.com/user-attachments/assets/1f05d8ee-66a2-4cc6-93ab-b8719fd20011" />
<img width="1304" height="907" alt="image" src="https://github.com/user-attachments/assets/9a180f8c-b8a4-4942-9f52-4b139dcc4d7e" />






