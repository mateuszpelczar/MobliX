-- Tworzenie tabeli search_logs dla statystyk wyszukiwań
CREATE TABLE IF NOT EXISTS search_logs (
    id BIGSERIAL PRIMARY KEY,
    search_query VARCHAR(500),
    brand VARCHAR(100),
    model VARCHAR(100),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    user_id BIGINT,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    results_count INTEGER,
    
    CONSTRAINT fk_search_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indeksy dla wydajności zapytań
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX idx_search_logs_brand ON search_logs(brand);
CREATE INDEX idx_search_logs_model ON search_logs(model);
CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX idx_search_logs_session_id ON search_logs(session_id);
