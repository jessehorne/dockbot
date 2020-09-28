const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var m = {};

m.help = "`db wanted` - See who the Royal Navy is looking for!";

m.valid = function(data) {
  if (data[0] != "wanted") {
    return false;
  }

  return true;
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

  // Get most wanted pirates
  var pirates = await models.User.findAll({
    where: {
      karma: {
        [Op.lt]: 0,
      }
    },
    limit: 10,
    order: [
      ['karma', 'ASC']
    ]
  });

  // Create message
  var message = "";

  if (pirates.length == 0) {
    message = "There doesn't appear to be anyone on this list...yet.";
  } else {
    pirates.forEach(function(p, i) {
      const reward = helpers.db.format_money(Math.abs(p.karma) * 1000);
      message += (i+1) + ". Pirate `" + p.name + "`. REWARD `$" + reward + "`.\n";
    });
  }

  // Create Embed
  const embed = new Discord.MessageEmbed();
  embed.setColor('#d90000');
  embed.setTitle(`A flier from ye Royal Navy`);

  embed.setDescription('The Royal Navy by order of the Queen has issued this list of the **Most Wanted** people in all of the Endless Seas. These criminals are wanted DEAD or alive...but mostly dead. If you see one of these pirates, do not hesitate to bring them justice.');


  embed.addField('Most Wanted', message)

  embed.setFooter('*You see a small black flag marked at the bottom.*');

  data.reply("", embed);

  return true;
}

module.exports = m
