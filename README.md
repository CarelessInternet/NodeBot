# Nodebot

Welcome to the official GitHub page for NodeBot! You are welcome to look at all of the source code right here!<br>

## Support

[Here's the link](https://discord.gg/rrfDTbcPvF)

## Setup

#### Acquiring Files
Get the files by running `git clone https://github.com/CarelessInternet/NodeBot.git`

#### Installing MySQL
MySQL is required to run the bot. However, you can go find a tutorial to install MySQL if you don't have it already, because I don't want to help for this step

#### Creating `.env` File
To do anything with the bot, create a file named `.env` and add all necessary environment variables in the list labelled "Environment Variables."<br>
The Presence Intent needs to be enabled for your bot, don't forget to do that in your discord bot's settings!

#### Installing Dependencies
Run the command `npm i` to install all dependencies. This is only needed once

#### Creating MySQL Tables
Run the command `npm run mysql` to create all necessary tables. This is only needed once

#### Deploying Commands
Run the command `npm run deploy` to deploy all commands. This is only needed once if you're not adding new commands.<br>
If you are, please run this command when you have done so

#### Changing Emojis
Some commands may use custom emojis, so you will have to manually change them yourselves.<br>
I don't know which commands have custom emojis, so good luck trying to find them

#### Running the Bot
Run the command `npm start` to run the bot in a development environment (recommended)<br>
Run the command `npm run production` to run the bot in a production environment

## Issues
If you can't get the bot to run, join the [support server](https://discord.gg/rrfDTbcPvF) and create a support ticket in #support.<br>
For any bug reports, suggestions or general feedback, join the support server or submit an issue

## Pull Requests
If you found any bug and created code to solve it, or updated anything important, feel free to submit a pull request so I can merge it into the default branch.<br>
You can also submit a pull request if you made a new command and want it to be a part of the production bot

## Environment Variables
* token
* clientID
* guildID (for sensitive information commands)
* ownerID (to restrict those commands to the owner of the bot)
* spotifyClientID
* spotifyClientSecret
* memerToken (for memer command, from the memer-api module)
* weatherAPIKey (from weatherapi.com)
* trackerGGAPIKey (for csgo stats)
* topGGToken (server and shard count, not required)
* youtubeAPIKey (for faster youtube searching)
* dbHost (for database connections)
* dbUser
* dbPassword
* dbDatabase
* dbPort (if not found, the bot will use the default `3306`)

## Database Structure
The columns with bigint(20) can be bigint(18) because twitter/discord snowflakes are 18 characters long

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