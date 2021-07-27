require('dotenv').config();

// sharding is required for multiple instances of the bot running at the same time for maximum efficiency and performance
const {ShardingManager} = require('discord.js');
const dateFormat = require('dateformat');
const token = process.env.token;

const shards = new ShardingManager('./bot.js', {
  token: token,
  totalShards: 'auto'
});
shards.on('shardCreate', shard => {
  console.log(`Created shard #${shard.id} at ${dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')}`);
});

shards.spawn(shards.totalShards);