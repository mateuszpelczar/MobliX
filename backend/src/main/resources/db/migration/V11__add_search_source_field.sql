-- Dodanie pola search_source do tabeli search_logs
ALTER TABLE search_logs
ADD COLUMN search_source VARCHAR(50);

-- Indeks dla wydajności zapytań
CREATE INDEX idx_search_logs_source ON search_logs(search_source);

-- Komentarz opisujący pole
COMMENT ON COLUMN search_logs.search_source IS 'Źródło wyszukiwania: navbar (pasek nawigacji), catalog_search (wyszukiwarka w katalogu), catalog_filter (filtry w katalogu)';
