const mysql = require('mysql');
const connection = mysql.createPool({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
  port: process.env.dbPort,
  connectionLimit: 100,
  supportBigNumbers: true,
  bigNumberStrings: true
});

module.exports = connection;