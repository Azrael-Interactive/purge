const Discord = require('discord.js');
const botconfig = require('./botconfig.json');
const config = require('./botconfig.json');
const messageHandler = require('./messageHandler.js');
const bot = new Discord.Client();
const deleter = require('./deleter.js');
let guild = bot.guilds.get("569304035472179200");

let Guild = null;

let channels = [];

bot.on("ready", async () => {
  guild = bot.guilds.get(botconfig.guild);
  messageHandler.init(bot.user.id, bot.guilds.get(botconfig.guild), botconfig.messages)
  console.log(`${bot.user.username} is working!`);

     botconfig.channels.forEach(c => {
       c = guild.channels.get(c);
       switch(c.type){
         case 'text':
           channels.push(c);
           break;
         case 'category':
           channels = channels.concat(guild.channels.filter(_c => _c.parentID === c.id && _c.type === 'text').array());
           break;
       }
     });


});

bot.on('message', message => messageHandler.handle(message));

bot.on('error', err => console.error(err));

process.setMaxListeners(0);

process.on('uncaughtException', err => console.error(err.stack));

process.on('unhandledRejection', err => console.error(`Uncaught Promise Rejection: \n${err.stack}`));

bot.on('guildMemberRemove', member => {
if(member.guild.id !== botconfig.guild) return;
const logChannel = bot.channels.get(botconfig.logChannel);
const guild = bot.guilds.get("569304035472179200");
// logChannel.send(`Deleting messages from \`${member.user.username}#${member.user.discriminator}\``);
deleter.delete(member.user, channels, n => {
  let deletedembed = new Discord.RichEmbed()
  .setAuthor("Auto Purge", bot.user.avatarURL)
  .setThumbnail(`${member.user.avatarURL}`)
  .addField("User Left", `**${member.user.username}#${member.user.discriminator}**\n\`${member.user.id}\``)
  .addField("Messages Deleted", `\`${n}\``)
  .setColor("c04949")
  .setFooter(`User joined ${member.joinedAt}`, guild.iconURL)

  if(botconfig.logChannel)
    logChannel.send(deletedembed);
});
});

bot.login(botconfig.token);
