<div align="center">
  
  [![Discord Bots](https://top.gg/api/widget/507915396037214208.svg)](https://top.gg/bot/507915396037214208)

</div>

# NodeBot

Welcome to the official GitHub page for NodeBot! You are welcome to look at all of the source code right here!<br>
The source code is mainly for educational and demonstration purposes on building a Discord bot.<br>
I advise you to only clone this repository for making pull requests, or making your own private version of the bot<br>

[Support Server](https://discord.gg/rrfDTbcPvF)

## Setup

### Acquiring Files

Get the files by running `git clone https://github.com/CarelessInternet/NodeBot.git`

### Installing MySQL

MySQL is required to run the bot. However, you can go find a tutorial to install MySQL if you don't have it already, because I don't want to help for this step

### Creating `.env` File

To do anything with the bot, create a file named `.env` and add all necessary environment variables that can be found in `src/environment.d.ts`

### Installing Dependencies

Run the command `npm i` to install all dependencies. This is only needed once

### Building

Run the command `npm run build` to compile the files

### Creating MySQL Tables

Run the command `npm run mysql` to create all necessary tables. This is only needed once. Structure can be found in `src/other/mysql.ts`

### Deploying Commands

Run the command `npm run deploy` to deploy all commands. This is only needed once if you're not adding new commands.<br>
If you are, please run this command when you have done so

### Running the Bot

Run the command `npm start` to run the bot in a development environment (ALWAYS use this for development)<br>
Run the command `npm run production` to run the bot in a production environment

## Issues

If you can't get the bot to run, join the [support server](https://discord.gg/rrfDTbcPvF) and create a support ticket in #support.<br>
For any bug reports, suggestions or general feedback, join the support server or submit an issue

## Pull Requests

If you found any bug and created code to solve it, or updated anything important, feel free to submit a pull request so I can merge it into the default branch.<br>
You can also submit a pull request if you made a new command and want it to be a part of the production bot
