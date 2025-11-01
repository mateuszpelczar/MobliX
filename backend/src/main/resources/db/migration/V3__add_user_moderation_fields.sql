-- Dodanie pól do moderacji i śledzenia aktywności w tabeli users
ALTER TABLE users
ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN blocked_until TIMESTAMP,
ADD COLUMN block_reason VARCHAR(500),
ADD COLUMN last_activity TIMESTAMP,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Aktualizacja istniejących użytkowników - ustawienie wartości domyślnych
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE users SET last_activity = CURRENT_TIMESTAMP WHERE last_activity IS NULL;

-- Dodanie indeksów dla lepszej wydajności zapytań
CREATE INDEX idx_users_is_blocked ON users(is_blocked);
CREATE INDEX idx_users_last_activity ON users(last_activity);