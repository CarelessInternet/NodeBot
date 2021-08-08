const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbDatabase,
  port: process.env.dbPort
});
connection.connect(err => {
  if (err) console.error(err);
});

module.exports = connection;