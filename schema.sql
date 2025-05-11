-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS delta_app;
USE delta_app;

-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS user;

-- Create user table with proper structure
CREATE TABLE user (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);