// Default database config - these values should work for most users
module.exports = {
  app: {
    name: 'User Management System',
    port: 3000  // Default port for local development
  },
  db: {
    host: 'localhost',
    user: 'root',      // Standard MySQL user
    database: 'delta_app',  // Make sure this DB exists!
    password: 'YOUR_DB_PASSWORD'  // Don't forget to change this
  }
}; 