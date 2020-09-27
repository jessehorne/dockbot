const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var me = {};

me.help = "`db me` - Get your stats!";

me.valid = function(data) {
  if (data[0] != "me") {
    return false;
  }

  return true;
}

me.pass = function(data) {
  return false;
}

me.handle = async function(data, user=null) {
  // Validate
  const msg = helpers.db.parse_msg(data);
  if (!me.valid(msg)) {
    return false;
  }

  // Run it!

  // Get User
  const db_user = await models.User.findOne({
    where: {
      discord_id: data.author.id
    }
  });

  // Create Embed
  const embed = new Discord.MessageEmbed();
  embed.setColor('#03f4fc');
  embed.setTitle(`Stats`);

  var message = "";

  var fields = [
    { name: 'Name', value: db_user.name },
    { name: 'Karma', value: db_user.karma },
    { name: 'Experience', value: db_user.exp },
    { name: 'Strength', value: db_user.strength },
    { name: 'HP', value: db_user.hp + "/" + db_user.max_hp },
    { name: 'Wallet', value: "$" + db_user.wallet },
    { name: 'Bank', value: "$" + db_user.bank },
    { name: 'Total Commands', value: db_user.total_commands }
  ];

  fields.forEach(function(c) {
    message = message + "`" + c.name + "` - " + c.value + "\n";
  });

  embed.addField('Stats', message);

  embed.setFooter('Need help? Try "db help"');

  data.reply("", embed);

  return true;
}

module.exports = me
