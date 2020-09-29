const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db attack @user` - Attacks a user with your equipped weapon!";

m.valid = function(data) {
  const msg = helpers.db.parse_msg(data);
  if (msg[0] != "attack") {
    return false;
  }

  // if (global.users[data.author.id].weapon_timeout) {
  //   data.reply("Please wait at least `10 seconds` between attacks.");
  //   return false;
  // }

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

  // Check if user is mentioned
  const mention_id = data.mentions.users.first().id;
  var mention_user = global.users[mention_id];

  if (!mention_id) {
    data.reply("You need to mention somebody to attack them, sailor...");
    return true;
  }

  // Check if user has weapon equipped
  var inv = JSON.parse(user.inventory);
  var weapon;

  inv.forEach(function(i) {
    if (i.type == "weapon" && i.equipped) {
      weapon = i;
    }
  });

  if (!weapon) {
    data.reply("You need to equip a weapon first...Aaarg!");
    return true;
  }

  // Determine if we know the user
  // if (mention_id == user.discord_id) {
  //   data.reply("You really want to attack yourself!?");
  //   return true;
  // }

  if (!mention_user) {
    data.reply("Sorry, I don't know that user.");
    return true;
  }

  // get DB user
  var db_user = await models.User.findOne({
    where: {
      discord_id: mention_id
    }
  });

  if (!db_user) {
    data.reply("Sorry, I don't know that user.");
    return true;
  }

  // Calculate damage
  var random = Math.floor(Math.random() * 10);
  var strength = user.strength;
  var weapon_dmg = weapon.dmg;

  var dmg = random + strength + weapon_dmg;

  db_user.hp -= dmg;

  if (db_user.hp <= 0) {
    db_user.hp = db_user.max_hp;
    user.wallet += db_user.wallet;
    db_user.wallet = 0;

    // if most wanted
    if (db_user.karma < 0) {
      user.wallet += Math.abs(db_user.karma)*1000;
    }

    db_user.karma = 0;
    user.karma -= 1;

    await user.save();
    await db_user.save();

    data.reply("You killed `" + db_user.name + "`! Your karma has went down a point. Don't end up on the Royal Navys Most Wanted list!");
    return true;
  }

  var explain = "You rolled a `" + random + "` with a strength of `" + strength + "` and a weapon bonus of `" + weapon_dmg + "` totaling to `" + dmg + "` points of damage! Your opponents HP is now `" + db_user.hp + "`";

  await db_user.save();

  data.reply(explain);

  var mem_user = global.users[data.author.id];
  mem_user.weapon_timeout = true;

  setTimeout(function() {
    mem_user.weapon_timeout = false;
  }, 10000);

  return true;
}

module.exports = m
