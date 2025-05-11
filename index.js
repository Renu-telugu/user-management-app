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

// Setting up middleware 
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Added session management - helps with user feedback
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
  
  // Had some issues with dropped connections, this fixes it
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

// Helper to generate random user data
const getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// Made this to avoid callback hell
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// For hashing passwords - security first!
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// To check passwords during login/verification
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Home page
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

// Show all users in a table
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

// Edit user form
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

// Update user - PATCH method
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
    
    // Check if password is correct
    const passwordMatch = await comparePassword(formPass, user.password);
    
    if (!passwordMatch) {
      req.flash('error_msg', 'Incorrect password');
      return res.redirect(`/user/${id}/edit`);
    }
    
    // Update the username
    await queryAsync("UPDATE user SET username = ? WHERE id = ?", [newUsername, id]);
    
    req.flash('success_msg', 'Username updated successfully');
    res.redirect("/user");
  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'Error updating user');
    res.redirect(`/user/${id}/edit`);
  }
});

// Form to add new user
app.get("/user/new", (req, res) => {
  res.render("adduser.ejs");
});

// Process the new user form
app.post("/user/new", async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Make sure we have all fields
    if (!username || !email || !password) {
      req.flash('error_msg', 'All fields are required');
      return res.redirect('/user/new');
    }
    
    // Hash password for security
    const hashedPassword = await hashPassword(password);
    
    // Insert the new user
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

// Delete user form
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

// Process user deletion
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { password: formPass, email: formEmail } = req.body;
  
  try {
    // Find the user first
    const result = await queryAsync("SELECT * FROM user WHERE id = ?", [id]);
    
    if (result.length === 0) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/user');
    }
    
    const user = result[0];
    
    // Double-check credentials for security
    const passwordMatch = await comparePassword(formPass, user.password);
    
    if (!passwordMatch) {
      req.flash('error_msg', 'Incorrect password');
      return res.redirect(`/user/${id}/delete`);
    } else if (formEmail !== user.email) {
      req.flash('error_msg', 'Incorrect email');
      return res.redirect(`/user/${id}/delete`);
    }
    
    // Delete the user
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

// Check if running directly or imported
if (require.main === module) {
  // Running directly (local development)
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
} else {
  // Being imported (for deployment)
  console.log('Exporting app for deployment');
}

// Export for deployment
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