import { green } from 'chalk';
import { config } from 'dotenv';
config();

import { connection } from '../utils';

// types for tables are available in the types folder

const createEconomyUsers = `
CREATE TABLE IF NOT EXISTS EconomyUsers (
  ID int NOT NULL AUTO_INCREMENT,
  UserID bigint(20) NOT NULL UNIQUE,
  CreationDate datetime NOT NULL,
  PRIMARY KEY (ID)
)
`;
const createEconomyGuilds = `
CREATE TABLE IF NOT EXISTS EconomyGuilds (
  ID int NOT NULL AUTO_INCREMENT,
  UserID bigint(20) NOT NULL,
  GuildID bigint(20) NOT NULL,
  Cash int NOT NULL,
  Bank int NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (UserID) REFERENCES EconomyUsers(UserID)
)
`;

(async () => {
	try {
		await connection.execute(createEconomyUsers);
		await connection.execute(createEconomyGuilds);

		console.log(green('Successfully created/added all required MySQL tables!'));
		process.exit(0);
	} catch (err) {
		console.error(err);
	}
})();
