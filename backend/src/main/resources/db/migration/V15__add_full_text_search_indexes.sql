-- Migracja: Dodanie Full-Text Search do PostgreSQL dla MobliX
-- Tabele: ogloszenia (Advertisement) + smartphone_specifications

-- Włącz rozszerzenie pg_trgm dla similarity search (tolerancja błędów)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. DODANIE KOLUMNY search_vector DO TABELI ogloszenia
-- =====================================================
ALTER TABLE ogloszenia ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- =====================================================
-- 2. FUNKCJA AKTUALIZUJĄCA SEARCH VECTOR DLA OGLOSZENIA
-- Używana przy UPDATE ogloszenia (nie INSERT, bo specyfikacja nie istnieje)
-- =====================================================
CREATE OR REPLACE FUNCTION update_advertisement_search_vector()
RETURNS TRIGGER AS $$
DECLARE
    spec_brand TEXT := '';
    spec_model TEXT := '';
BEGIN
    -- Pobierz dane ze smartphone_specifications jeśli istnieje
    SELECT COALESCE(brand, ''), COALESCE(model, '') 
    INTO spec_brand, spec_model
    FROM smartphone_specifications
    WHERE advertisement_id = NEW.id;

    -- Buduj search_vector z wagami:
    -- A = najwyższa waga (tytuł, marka, model)
    -- B = średnia waga (opis)
    NEW.search_vector := 
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', spec_brand), 'A') ||
        setweight(to_tsvector('simple', spec_model), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B');
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- W przypadku błędu, ustaw tylko tytuł i opis
    NEW.search_vector := 
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGER DLA AKTUALIZACJI OGLOSZENIA
-- =====================================================
DROP TRIGGER IF EXISTS advertisement_search_vector_update ON ogloszenia;
CREATE TRIGGER advertisement_search_vector_update
    BEFORE INSERT OR UPDATE ON ogloszenia
    FOR EACH ROW
    EXECUTE FUNCTION update_advertisement_search_vector();

-- =====================================================
-- 4. FUNKCJA AKTUALIZUJĄCA SEARCH VECTOR PRZY ZMIANIE SPECYFIKACJI
-- =====================================================
CREATE OR REPLACE FUNCTION update_search_vector_on_spec_change()
RETURNS TRIGGER AS $$
DECLARE
    ad_title TEXT := '';
    ad_description TEXT := '';
BEGIN
    -- Pobierz dane z ogloszenia
    SELECT COALESCE(title, ''), COALESCE(description, '')
    INTO ad_title, ad_description
    FROM ogloszenia
    WHERE id = NEW.advertisement_id;

    -- Zaktualizuj search_vector w ogloszenia
    UPDATE ogloszenia 
    SET search_vector = 
        setweight(to_tsvector('simple', ad_title), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.brand, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.model, '')), 'A') ||
        setweight(to_tsvector('simple', ad_description), 'B')
    WHERE id = NEW.advertisement_id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spec_search_vector_update ON smartphone_specifications;
CREATE TRIGGER spec_search_vector_update
    AFTER INSERT OR UPDATE ON smartphone_specifications
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector_on_spec_change();

-- =====================================================
-- 5. ZAKTUALIZUJ ISTNIEJĄCE REKORDY
-- =====================================================
UPDATE ogloszenia o SET search_vector = 
    setweight(to_tsvector('simple', COALESCE(o.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(ss.brand, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(ss.model, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(o.description, '')), 'B')
FROM smartphone_specifications ss
WHERE ss.advertisement_id = o.id;

-- Zaktualizuj również ogłoszenia bez specyfikacji
UPDATE ogloszenia SET search_vector = 
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(description, '')), 'B')
WHERE search_vector IS NULL;

-- =====================================================
-- 6. INDEKSY GIN DLA FULL-TEXT SEARCH
-- =====================================================
-- Główny indeks GIN dla tsvector (Full-Text Search)
CREATE INDEX IF NOT EXISTS idx_ogloszenia_search_vector 
ON ogloszenia USING GIN (search_vector);

-- =====================================================
-- 7. INDEKSY GIN DLA TRIGRAM (similarity - tolerancja błędów)
-- =====================================================
-- Indeks trigram dla tytułu ogłoszenia
CREATE INDEX IF NOT EXISTS idx_ogloszenia_title_trgm 
ON ogloszenia USING GIN (title gin_trgm_ops);

-- Indeks trigram dla marki w specyfikacjach
CREATE INDEX IF NOT EXISTS idx_specs_brand_trgm 
ON smartphone_specifications USING GIN (brand gin_trgm_ops);

-- Indeks trigram dla modelu w specyfikacjach
CREATE INDEX IF NOT EXISTS idx_specs_model_trgm 
ON smartphone_specifications USING GIN (model gin_trgm_ops);

-- Indeks trigram dla nazwy kategorii
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm 
ON categories USING GIN (name gin_trgm_ops);