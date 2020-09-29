require('dotenv').config();

const helpers = require("../helpers");
const models = require('../models').db;

var m = {};

m.help = "`db slap|punch|kick @user` - Attack your opponent!";

m.valids = ['slap', 'punch', 'kick'];
m.valids_plural = ['slapped', 'punched', 'kicked'];

m.valid = function(data) {
  const msg = helpers.db.parse_msg(data);

  if (!m.valids.includes(msg[0])) {
    return false;
  }

  // Make sure user is given
  if (!msg[1]) {
    data.reply("Are you trying to " + msg[0] + " yourself or the air?!");
    return false;
  }

  // Check for slap_timeout
  if (global.users[data.author.id].slap_timeout) {
    data.reply("Please wait at least `10 seconds` between attacks.");
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
  if (!m.valid(data)) {
    return false;
  }



  // Get user from mention
  const mention_id = data.mentions.users.first().id;
  var mention_user = global.users[mention_id];

  if (mention_id === process.env.DISCORD_ME) {
    data.reply("Oh no. That's not gonna work.");
    return true;
  }

  if (mention_user) {
    // var hit = Math.floor(Math.random() * 10) < 8;
    var hit = true;
    var hit_person;
    var hit_dmg = Math.floor(Math.random() * 10)+1;

    // Add strength to hit_dmg
    hit_dmg += user.strength;

    if (user.used_brass) {
      hit_dmg = hit_dmg * 2;
    }

    var affected_user;

    if (hit) {
      hit_person = msg[1];
      affected_user = await models.User.findOne({
        where: {
          discord_id: mention_id
        }
      });
    } else {
      hit_person = "yourself";
      affected_user = user;
    }

    affected_user.hp -= hit_dmg;

    hit_effect = m.valids_plural[m.valids.indexOf(msg[0])];

    if (affected_user.hp <= 0) {
      user.wallet += affected_user.wallet;

      // if most wanted
      if (affected_user.karma < 0) {
        user.wallet += Math.abs(affected_user.karma)*1000;
      }

      user.karma -= 1;
      await user.save();

      affected_user.hp = affected_user.max_hp;
      affected_user.wallet = 0;
      affected_user.karma = 0;
      hit_effect = "killed";
    }

    await affected_user.save();

    data.reply("You just " + hit_effect + " the heck out of " + hit_person + "\n`" + hit_dmg + "` points of damage!");
  } else {
    data.reply("I don't know that person.");
  }

  var mem_user = global.users[data.author.id];
  mem_user.slap_timeout = true;

  setTimeout(function() {
    mem_user.slap_timeout = false;
  }, 10000);

  return true;
}

module.exports = m
