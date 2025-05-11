// Config loader
const defaultConfig = require('./default');
const fs = require('fs');
const path = require('path');

let localConfig = {};
const localConfigPath = path.join(__dirname, 'local.js');

// Try to load local configuration if it exists
try {
  if (fs.existsSync(localConfigPath)) {
    localConfig = require('./local');
  }
} catch (error) {
  console.warn('No local configuration found. Using default values.');
}

// Deep merge function
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

// Merge default config with local config
const config = deepMerge(JSON.parse(JSON.stringify(defaultConfig)), localConfig);

// Override with environment variables if available
if (process.env.DB_HOST) config.db.host = process.env.DB_HOST;
if (process.env.DB_USER) config.db.user = process.env.DB_USER;
if (process.env.DB_NAME) config.db.database = process.env.DB_NAME;
if (process.env.DB_PASSWORD) config.db.password = process.env.DB_PASSWORD;
if (process.env.PORT) config.app.port = process.env.PORT;

console.log('Configuration loaded:', {
  app: config.app,
  db: {
    ...config.db,
    password: config.db.password ? '[REDACTED]' : undefined
  }
});

module.exports = config; 