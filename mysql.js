require('dotenv').config();

const connection = require('./db');
const createEconomyUsers =
`
CREATE TABLE IF NOT EXISTS EconomyUsers (
  ID int NOT NULL AUTO_INCREMENT,
  UserID bigint(20) NOT NULL UNIQUE,
  CreationDate datetime NOT NULL,
  PRIMARY KEY (ID)
)
`;
const createEconomyGuilds =
`
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
const createBlacklist =
`
CREATE TABLE IF NOT EXISTS Blacklist (
  ID int NOT NULL AUTO_INCREMENT,
  TargettedUserID bigint(20) NOT NULL,
  CreatorUserID bigint(20),
  GuildID bigint(20),
  Reason varchar(255) NOT NULL,
  CreationDate datetime NOT NULL,
  PRIMARY KEY (ID)
)
`;

(async () => {
  try {
    // we have to manually await each execution instead of doing Promise.all() to prevent foreign key error
    // const tables = [connection.execute(createEconomyUsers), connection.execute(createEconomyGuilds), connection.execute(createBlacklist)];
    // await Promise.all(tables);
    await connection.execute(createEconomyUsers);
    await connection.execute(createEconomyGuilds);
    await connection.execute(createBlacklist);
    console.log('Successfully created all required tables!');
  } catch(err) {
    console.error(err);
  }
})();