-- Usunięcie niepotrzebnych kolumn z tabeli ogloszenia
-- Sprawdź które kolumny rzeczywiście istnieją w bazie przed uruchomieniem

-- Usuń duplikowane kolumny obrazów (pozostaw tylko relację z tabelą zdjecia)
-- ALTER TABLE ogloszenia DROP COLUMN IF EXISTS image_url;
-- ALTER TABLE ogloszenia DROP COLUMN IF EXISTS imageid;
-- ALTER TABLE ogloszenia DROP COLUMN IF EXISTS image_id;

-- Usuń nieużywane pole product_description
-- ALTER TABLE ogloszenia DROP COLUMN IF EXISTS product_description;

-- UWAGA: Odkomentuj powyższe linie po sprawdzeniu które kolumny rzeczywiście istnieją
-- Możesz sprawdzić strukturę tabeli używając: DESCRIBE ogloszenia; lub \d ogloszenia