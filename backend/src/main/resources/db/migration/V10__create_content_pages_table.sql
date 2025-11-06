-- Tworzenie tabeli content_pages dla systemu CMS
CREATE TABLE IF NOT EXISTS content_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255)
);

-- Indeksy dla wydajności
CREATE INDEX idx_content_pages_slug ON content_pages(slug);

-- Wstaw domyślne strony
INSERT INTO content_pages (slug, title, content, last_updated) VALUES
('zasady-bezpieczenstwa', 'Zasady Bezpieczeństwa', '<h1>Zasady Bezpieczeństwa</h1><p>Tutaj znajdziesz zasady bezpiecznego korzystania z platformy MobliX.</p>', CURRENT_TIMESTAMP),
('popularne-wyszukiwania', 'Popularne Wyszukiwania', '<h1>Popularne Wyszukiwania</h1><p>Najczęściej wyszukiwane modele smartfonów.</p>', CURRENT_TIMESTAMP),
('jak-dziala-moblix', 'Jak Działa MobliX', '<h1>Jak Działa MobliX</h1><p>Dowiedz się jak korzystać z naszej platformy.</p>', CURRENT_TIMESTAMP),
('regulamin', 'Regulamin', '<h1>Regulamin</h1><p>Regulamin korzystania z serwisu MobliX.</p>', CURRENT_TIMESTAMP),
('polityka-cookies', 'Polityka Cookies', '<h1>Polityka Cookies</h1><p>Informacje o wykorzystywaniu plików cookies.</p>', CURRENT_TIMESTAMP),
('ustawienia-plikow-cookies', 'Ustawienia Plików Cookies', '<h1>Ustawienia Plików Cookies</h1><p>Zarządzaj ustawieniami plików cookies.</p>', CURRENT_TIMESTAMP)
ON CONFLICT (slug) DO NOTHING;
