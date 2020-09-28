const Discord = require('discord.js');

var db = {};

db.parse_msg = function(data) {
  var d = data.content.split(" ");
  d.shift();

  return d;
}

db.help = function(helps) {
  var message = "";

  helps.forEach(function(h) {
    message = message + h + "\n";
  });

  // Create Embed
  const embed = new Discord.MessageEmbed();
  embed.setColor('#03f4fc');
  embed.setTitle(`Oi Matey, need somethin'?`);

  embed.setDescription("Welcome to the Endless Seas. You're a pirate whose goal is to become the richest in the world. You'll earn money, gamble it and hoard it as best as you can. You can get to the top, especially with help from your friends. Be careful, though, because others will be there to cut you down.");

  embed.addFields(
    { name: 'Commands', value: message}
  );

  embed.setFooter('I hope this helps.');

  return embed;
}

db.format_money = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  db
}
