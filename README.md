<b>ATTENTION:</b> this branch uses the <b>slash command prefix</b>, because message content will be [deprecated in April 2022](https://support-dev.discord.com/hc/en-us/articles/4404772028055)

[NodeBot discord server](https://discord.gg/rrfDTbcPvF)

this repository introduces an economy system, you can view the database structure below under env variables

if u have any suggestions or bug reports, please open an issue.
<b>only submit bug reports for bugs found when running the bot. dont submit an issue if you cant get the bot to run, ask about it in the discord server in #support</b>

some emojis may be custom, thats for you to change to your own

env variables:
- token (discord bot token)
- clientID
- guildID (for sensitive information commands)
- ownerID (to restrict those commands to the owner of the bot)
- spotifyClientID
- spotifyClientSecret
- memerToken (for memer command, from the memer-api module)
- weatherAPIKey (from weatherapi.com)
- trackerGGAPIKey (for csgo stats)
- topGGToken (server and shard count, <b>only for NodeBot production</b>)
- youtubeAPIKey (for faster youtube searching)
- dbHost (for database connections)
- dbUser
- dbPassword
- dbDatabase
- dbPort

database structure:

(the ones that are bigint(20) can be reduced to bigint(18) since discord snowflakes are 18 characters long)
- EconomyUsers:
  * ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  * UserID bigint(20) NOT NULL UNIQUE,
  * CreationDate datetime NOT NULL,
  * UserCreationDate datetime NOT NULL
- EconomyGuilds:
  * ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  * UserID bigint(20) NOT NULL FOREIGN KEY REFERENCES EconomyUsers(UserID),
  * GuildID bigint(20) NOT NULL,
  * CreationDate datetime NOT NULL,
  * Cash int NOT NULL,
  * Bank int NOT NULL
- Blacklist:
  * ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  * TargettedUserID bigint(20) NOT NULL,
  * CreatorUserID bigint(20) NOT NULL,
  * GuildID bigint(20) NOT NULL,
  * Reason varchar(255) NOT NULL,
  * CreationDate datetime NOT NULL
