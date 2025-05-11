# User Management System

A simple user management system built with Node.js, Express, and MySQL.

## Features

- User listing with search functionality
- Add, edit and delete users
- Form validation and password security
- Responsive design

## Tech Stack

- Node.js with Express
- MySQL
- EJS templates
- Custom CSS
- method-override

## Database Structure

Single `user` table with:

- `id` (UUID): Primary key
- `username`: User's display name
- `email`: Email address (unique)
- `password`: Hashed password
- `created_at`: Creation timestamp

## Routes

- **GET /** - Home page with user count
- **GET /user** - View all users
- **GET/POST /user/new** - Add new user
- **GET/PATCH /user/:id** - Edit user
- **GET/DELETE /user/:id/delete** - Delete user

## Setup

1. Clone repository
2. Run `npm install`
3. Copy `config/local.js.example` to `config/local.js` and update credentials
4. Run `mysql -u root -p < schema.sql`
5. Start with `npm run dev`
6. Visit http://localhost:3000
