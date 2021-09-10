## Disclaimer

The information here may not always be up to date. If it isn't up to date, feel free to join the [support server](https://discord.gg/rrfDTbcPvF) and tell me or open an issue here on GitHub.<br>
Last Updated: September 10, 2021

## What do you mean by "Discord Data?"

From the official [Discord Developer Privacy Policy](https://discord.com/developers/docs/policy):
> “Discord Data” means any and all data you obtain through the APIs.

# Privacy Policy

## What Discord Data do you collect?

As of right now, NodeBot collects the following Discord Data on success and if it isn't already stored:
- Music Commands:
  * Guild ID
- Economy Commands:
  * User ID
  * Guild ID
- Blacklisting Commands:
  * User ID
  * Guild ID
  * Mentioned user's ID
  * The reasoning behind a blacklist

## What other data is collected/created?

As of right now, NodeBot collects/creates the following data on success:

- Economy Commands:
  * Time of first command usage (technically not Discord Data, since it just takes the current time)
  * Cash & Bank Money (the bot automatically creates these for you, obviously it's not your cash or bank amount in real life)
- Blacklisting Commands:
  * Time of blacklist (again, technically not Discord Data, since it just takes the current time)

## Why do you need the data?

All of the data collected is required to keep the economy/blacklisting/music commands functioning as expected.

## How do you use the data?

Music data is used to store temporary data for the queuing system.<br>
Economy data may be used to tell different users apart, and keep track of money.<br>
Blacklist data may be used to tell different users apart, and prevent blacklisted users from using NodeBot commands.<br>
All data stored is displayed to the user and others in the Discord server through different commands in one way or another, so no data is kept secret.

## How long is the data stored for?

Music data gets deleted when no songs are left in queue, or the bot gets disconnected, or an error occurs.<br>
Economy data remains permanently.<br>
Blacklist data remains until a user with sufficient permissions whitelists the user, which is when the data gets deleted permanently.

## Do you share any data to companies or other people?

No data is shared with anyone or any companies.

## How can users contact you if they have concerns about your bot?

They may join the official support server, or open an issue on GitHub.

## How can users have the data removed?

Again, they may join the official support server, or open an issue on GitHub clarifying why they want the data removed.
As long as it's an acceptable reason, I will remove the data from the database.