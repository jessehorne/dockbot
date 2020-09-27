const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db me` - Get your stats!";

m.healths = [
  ":heart:", ":brown_heart:", ":orange_heart:", ":yellow_heart:", ":green_heart:",
  ":blue_heart:", ":purple_heart:", ":white_heart:", ":black_heart:"
];

m.healths = m.healths.reverse();

m.valid = function(data) {
  if (data[0] != "me") {
    return false;
  }

  return true;
}

m.get_heart_code = function(user) {
  const nine = user.max_hp / 9;

  for (var x=1; x<=9; x++) {
    if (user.hp <= x*nine) {
      return m.healths[x-1];
    }
  }

  return m.healths[m.healths.length-1];
}

m.pass = function(data) {
  return false;
}

m.handle = async function(data, user=null) {
  // Validate
  const msg = helpers.db.parse_msg(data);
  if (!m.valid(msg)) {
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
  embed.setTitle(`Aaarrg, here's yer record...`);

  const heart_code = m.get_heart_code(db_user);

  var message = "";

  var fields = [
    { name: 'Pirate Name', value: "__*" + db_user.name + "*__" },
    { name: 'Karma', value: ":yin_yang: " + db_user.karma },
    { name: 'Strength', value: ":muscle: " + db_user.strength },
    { name: 'HP', value: heart_code + " " + db_user.hp + "/" + db_user.max_hp },
    { name: 'Wallet', value: ":dollar: $" + helpers.db.format_money(db_user.wallet) },
    { name: 'Bank', value: ":moneybag: $" + helpers.db.format_money(db_user.bank) },
    { name: 'Total Commands Thus Far', value: db_user.total_commands }
  ];

  fields.forEach(function(c) {
    const spacer = 12;
    const count = spacer - c.name.length;
    var spaces = "";
    for (var x=0; x<count/2; x++) { spaces += " "; }
    message = message + "`" + spaces + c.name + spaces + "` " + c.value + "\n";
  });

  embed.addField('Stats', message);

  embed.setFooter('Need help? Try "db help"');

  data.reply("", embed);

  return true;
}

module.exports = m
