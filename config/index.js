// Config loader - nothing fancy, just a simple way to manage configs
const defaultConfig = require('./default');
const fs = require('fs');
const path = require('path');

let localConfig = {};
const localConfigPath = path.join(__dirname, 'local.js');

// Try loading local config if it exists
try {
  if (fs.existsSync(localConfigPath)) {
    localConfig = require('./local');
    console.log('Loaded local configuration');
  }
} catch (error) {
  console.warn('No local configuration found. Using default config values.');
}

// Simple function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

// Merge configurations - defaultConfig is the base, localConfig overrides it
const config = deepMerge(JSON.parse(JSON.stringify(defaultConfig)), localConfig);

// Allow environment variables to override config values
// I added this for deployment flexibility
if (process.env.DB_HOST) config.db.host = process.env.DB_HOST;
if (process.env.DB_USER) config.db.user = process.env.DB_USER;
if (process.env.DB_NAME) config.db.database = process.env.DB_NAME;
if (process.env.DB_PASSWORD) config.db.password = process.env.DB_PASSWORD;
if (process.env.PORT) config.app.port = process.env.PORT;

// Added this for troubleshooting - password is hidden for security
console.log('Configuration loaded:', {
  app: config.app,
  db: {
    ...config.db,
    password: config.db.password ? '[HIDDEN]' : undefined
  }
});

// Add SSL support - needed for some DB providers
if (process.env.DB_SSL === 'true') {
  config.db.ssl = {
    rejectUnauthorized: true
  };
}

module.exports = config; 