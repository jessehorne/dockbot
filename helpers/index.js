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
  embed.setTitle(`Stats`);

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
