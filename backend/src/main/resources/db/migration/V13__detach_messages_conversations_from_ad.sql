-- Detach messages and conversations from Advertisement foreign key constraints
-- Drops FK constraints referencing ogloszenia(id) on messages and conversations (if present)

-- Drop known messages FK if exists
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS fk_messages_advertisement;

-- Drop any foreign key on messages referencing ogloszenia
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_class ref ON ref.oid = con.confrelid
    WHERE rel.relname = 'messages' AND ref.relname = 'ogloszenia' AND con.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE messages DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

-- Drop any foreign key on conversations referencing ogloszenia
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_class ref ON ref.oid = con.confrelid
    WHERE rel.relname = 'conversations' AND ref.relname = 'ogloszenia' AND con.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE conversations DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

-- Create indexes on advertisement_id columns to preserve performance (if columns exist)
CREATE INDEX IF NOT EXISTS idx_messages_advertisement_id ON messages(advertisement_id);
CREATE INDEX IF NOT EXISTS idx_conversations_advertisement_id ON conversations(advertisement_id);
