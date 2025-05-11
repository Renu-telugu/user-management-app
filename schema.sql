-- Database setup script for User Management System
-- Run this script to initialize your MySQL database

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS delta_app;
USE delta_app;

-- Drop the existing user table if needed (careful - this deletes all data!)
DROP TABLE IF EXISTS user;

-- Create new user table
CREATE TABLE user (
    id VARCHAR(50) PRIMARY KEY,  -- Using UUID format
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,  -- Emails must be unique
    password VARCHAR(100) NOT NULL,      -- Will store bcrypt hashed passwords
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Auto timestamp
);

-- Example queries I use often:

-- Get all users
-- SELECT * FROM user;

-- Count total users
-- SELECT COUNT(*) FROM user;

-- Find a specific user
-- SELECT * FROM user WHERE id = ?;

-- Update a username
-- UPDATE user SET username = ? WHERE id = ?;

-- Delete a user (be careful!)
-- DELETE FROM user WHERE id = ?;