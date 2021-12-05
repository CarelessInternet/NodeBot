import { createConnection } from 'mysql2';

/**
 * Creates a connection to mysql
 */
const connection = createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: parseInt(process.env.DB_PORT) || 3306,
	connectionLimit: 100,
	supportBigNumbers: true,
	bigNumberStrings: true
}).promise();

export default connection;
