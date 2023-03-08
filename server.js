const app = require('./app.js');

const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config({ path: './config.env' });
}

process.on('uncaughtException', err => {
  console.log('Uncaught exception. Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to database
const DB = process.env.DB_STRING.replace('<password>', process.env.DB_PASS);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to database.'))
  .catch(err => console.log(err));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server listening on port ' + port));

// process.on('unhandledRejection', err => {
//   console.log('Unhandled rejection. Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
