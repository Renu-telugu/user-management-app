const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('./config');

// Middleware setup
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Session and flash setup
app.use(session({
  secret: 'deltaappsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
app.use(flash());

// Pass flash messages to all templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Database connection
let connection;

function createConnection() {
  // Close previous connection if exists
  if (connection) {
    try {
      connection.end();
    } catch (error) {
      console.error('Error closing previous connection:', error.message);
    }
  }
  
  // Create new connection
  connection = mysql.createConnection(config.db);
  
  // Handle connection errors
  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Database connection lost. Reconnecting...');
      setTimeout(createConnection, 2000);
    } else {
      throw err;
    }
  });
}

// Initialize connection
createConnection();

// Helper functions
const getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Async query function to use promises instead of callbacks
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Routes

// Home
app.get("/", async (req, res) => {
  try {
    const result = await queryAsync("SELECT count(*) FROM user", []);
    const count = result[0]['count(*)'];
    res.render("home.ejs", { count });
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Database error occurred');
    res.redirect('/');
  }
});

// Show all users
app.get("/user", async (req, res) => {
  try {
    const users = await queryAsync("SELECT * FROM user", []);
    res.render("showusers.ejs", { users });
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error retrieving users');
    res.redirect('/');
  }
});

// Edit form
app.get("/user/:id/edit/", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await queryAsync("SELECT * FROM user WHERE id = ?", [id]);
    
    if (result.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user');
    }
    
    const user = result[0];
    res.render("edit.ejs", { user });
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error retrieving user');
    res.redirect('/user');
  }
});

// Update user
app.patch("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { password: formPass, username: newUsername } = req.body;
  
  try {
    // Get user
    const result = await queryAsync("SELECT * FROM user WHERE id = ?", [id]);
    
    if (result.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user');
    }
    
    const user = result[0];
    
    // Verify password
    const passwordMatch = await comparePassword(formPass, user.password);
    
    if (!passwordMatch) {
      req.flash('error_msg', 'Incorrect password');
      return res.redirect(`/user/${id}/edit`);
    }
    
    // Update username
    await queryAsync("UPDATE user SET username = ? WHERE id = ?", [newUsername, id]);
    
    req.flash('success_msg', 'Username updated successfully');
    res.redirect("/user");
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error updating user');
    res.redirect(`/user/${id}/edit`);
  }
});

// Show add user form
app.get("/user/new", (req, res) => {
  res.render("adduser.ejs");
});

// Add new user
app.post("/user/new", async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Input validation
    if (!username || !email || !password) {
      req.flash('error_msg', 'All fields are required');
      return res.redirect('/user/new');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert user
    await queryAsync(
      "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)",
      [faker.string.uuid(), username, email, hashedPassword]
    );
    
    req.flash('success_msg', 'User added successfully');
    res.redirect("/user");
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error adding user');
    res.redirect('/user/new');
  }
});

// Delete form
app.get("/user/:id/delete/", async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await queryAsync("SELECT * FROM user WHERE id = ?", [id]);
    
    if (result.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user');
    }
    
    const user = result[0];
    res.render("delete.ejs", { user });
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error retrieving user');
    res.redirect('/user');
  }
});

// Delete user
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { password: formPass, email: formEmail } = req.body;
  
  try {
    // Get user
    const result = await queryAsync("SELECT * FROM user WHERE id = ?", [id]);
    
    if (result.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user');
    }
    
    const user = result[0];
    
    // Verify credentials
    const passwordMatch = await comparePassword(formPass, user.password);
    
    if (!passwordMatch) {
      req.flash('error_msg', 'Incorrect password');
      return res.redirect(`/user/${id}/delete`);
    } else if (formEmail !== user.email) {
      req.flash('error_msg', 'Incorrect email');
      return res.redirect(`/user/${id}/delete`);
    }
    
    // Delete user
    await queryAsync("DELETE FROM user WHERE id = ?", [id]);
    
    req.flash('success_msg', 'User deleted successfully');
    res.redirect("/user");
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error deleting user');
    res.redirect(`/user/${id}/delete`);
  }
});

// Start server
const port = process.env.PORT || config.app.port || 3000;

// Check if this is being run directly or imported as a module (for serverless)
if (require.main === module) {
  // Running directly (local development)
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // Being imported (serverless environment)
  console.log('Exporting app for serverless deployment');
}

// Export the Express app for serverless environments
module.exports = app;

// try{
//   connection.query(q, [data], (err, result) => {
//     if(err) throw err;
//     console.log(result);
//   });
// } catch(err) {
//   console.log(err);
// }

// connection.end();