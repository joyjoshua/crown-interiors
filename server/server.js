/**
 * Crown Interiors API — Entry Point
 *
 * Loads environment variables, imports the Express app,
 * and starts the HTTP server on the configured port.
 */

require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Crown Interiors API running on port ${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
