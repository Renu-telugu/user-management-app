# User Management System

A simple user management system built with Node.js, Express, and MySQL.

## Features

- View a list of all users with search and sort functionality
- Add new users with validation
- Edit existing user usernames
- Delete users with credential verification
- Clean, responsive UI

## Security Improvements

- Password hashing with bcrypt
- Parameterized SQL queries to prevent SQL injection
- Input validation on both client and server side
- Flash messages for user feedback
- Configuration management to protect sensitive credentials

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **View Engine**: EJS
- **Styling**: Custom CSS
- **Form Handling**: method-override

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your database:
   - Copy `config/local.js.example` to `config/local.js`
   - Update `config/local.js` with your database credentials
   ```javascript
   // Example config/local.js
   module.exports = {
     db: {
       host: "localhost",
       user: "your_db_username",
       database: "delta_app",
       password: "your_db_password",
     },
   };
   ```
4. Set up MySQL database:
   ```
   mysql -u root -p < schema.sql
   ```
5. Start the application:
   ```
   npm run dev
   ```
6. Access the application at `http://localhost:3000`

## Database Structure

The application uses a simple MySQL database with a single `user` table:

- `id` (UUID): Primary key
- `username`: User's display name
- `email`: User's email address (unique)
- `password`: Hashed password
- `created_at`: Timestamp when the user was created

## Routes

- **GET /** - Home page with user count
- **GET /user** - View all users
- **GET /user/new** - Form to add a new user
- **POST /user/new** - Add a new user
- **GET /user/:id/edit** - Form to edit a user
- **PATCH /user/:id** - Update a user
- **GET /user/:id/delete** - Form to delete a user
- **DELETE /user/:id** - Delete a user
