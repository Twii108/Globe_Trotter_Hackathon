-- Migration 002: Create Trips Table

CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    description TEXT,
    cover_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
