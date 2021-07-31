require('dotenv').config();

// sharding is required for multiple instances of the bot running at the same time for maximum efficiency and performance
// commented lines are for production where you can see server count and shard count in top.gg
const {ShardingManager} = require('discord.js');
// const {AutoPoster} = require('topgg-autoposter');
const dateFormat = require('dateformat');
const token = process.env.token;
// const topGGToken = process.env.topGGToken;
// test commit + push

const shards = new ShardingManager('./bot.js', {
  token: token,
  totalShards: 'auto'
});
shards.on('shardCreate', shard => {
  console.log(`Created shard #${shard.id} at ${dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')}`);
});

// const poster = AutoPoster(topGGToken, shards);
// poster.on('error', console.error);

shards.spawn(shards.totalShards);