-- Ustaw is_blocked = false dla wszystkich użytkowników, gdzie jest NULL
UPDATE users SET is_blocked = false WHERE is_blocked IS NULL;

-- Upewnij się, że kolumna ma wartość domyślną
ALTER TABLE users ALTER COLUMN is_blocked SET DEFAULT false;