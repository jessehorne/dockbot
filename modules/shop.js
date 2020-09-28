const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db shop` - Shop for useful items!\n";
m.help += "`db buy X` - Buy item X from shop!\n";
m.help += "`db use X` - Use X item!\n";
m.help += "`db inv` - Show your inventory!";

m.items = [
  {name: 'Health Pack', desc: 'Restores HP to full.', key: 'health', cost: 1000 },
  {name: 'Brass Knuckles', desc: 'Doubles future attack damage for life.', key: 'brass', cost: 50000 },
  // {name: 'Experience Pack', desc: 'Increases experience level by 1 point.', key: 'exp', cost: 1000 },
  {name: 'Karma Pack', desc: 'Brings karma level back to 0.', key: 'karma', cost: 5000 },
  {name: 'Armor', desc: 'Gives you an extra 50 hp.', key: 'armor', cost: 1000 },
  {name: 'Strength Juice', desc: 'Increases your strength by 1 point.', key: 'strength', cost: 1000 },
];

m.shop_list_embed = function(user) {
  const embed = new Discord.MessageEmbed();
  embed.setColor('#6b32a8');
  embed.setTitle(`Shop`);

  embed.setDescription('These items will help you on your quest.');


  var message = "";

  m.items.forEach(function(i, index) {
    if (i.key == "brass" && user.used_brass) {
      message += (index+1) + ". ~~" + i.name + "~~ - `" + i.key + "` for `$" + helpers.db.format_money(i.cost) + "` - " + i.desc + "\n";
    } else {
      message += (index+1) + ". " + i.name + " - `" + i.key + "` for `$" + helpers.db.format_money(i.cost) + "` - " + i.desc + "\n";
    }
  });

  embed.addField('Available Items', message);

  embed.setFooter("Don't forget to use the item once you buy it!");

  return embed;
}

m.valids = ["shop", "buy", "use", "inv"];

m.valid = function(data) {
  if (!m.valids.includes(data[0])) {
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

  // SHOP
  if (msg[0] == "shop") {
    data.reply("", m.shop_list_embed(user));
    return true;
  }

  // BUY
  if (msg[0] == "buy") {
    if (!msg[1]) {
      data.reply("Okay, you just bought nothing! Congratulations.");
      return true;
    }

    const item_key = msg[1];

    const item_cost = m.item_cost(item_key);

    console.log("item cost", item_cost)

    if (!item_cost) {
      data.reply("I'm sorry, I have no idea what you're trying to buy.");
      return true;
    }

    // Valid Item...now lets check to make sure the user can afford it
    if (item_cost > user.wallet) {
      data.reply("You can't afford that!");
      return true;
    }

    // The user can afford it, lets buy it IF they can own it
    if (item_key == "health") {
      var added = m.add_inv_item(user, "health");

      if (added) {
        data.reply("You've bought one `health`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    } else if (item_key == "brass") {
      var added = m.add_inv_item(user, "brass");

      if (added) {
        data.reply("You've bought one `brass`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    } else if (item_key == "exp") {
      var added = m.add_inv_item(user, "exp");

      if (added) {
        data.reply("You've bought one `exp`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    } else if (item_key == "karma") {
      var added = m.add_inv_item(user, "karma");

      if (added) {
        data.reply("You've bought one `karma`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    } else if (item_key == "armor") {
      var added = m.add_inv_item(user, "armor");

      if (added) {
        data.reply("You've bought one `armor`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    } else if (item_key == "strength") {
      var added = m.add_inv_item(user, "strength");

      if (added) {
        data.reply("You've bought one `strength`.");
      } else {
        data.reply("Sorry. You can't do that.");
        return true;
      }
    }

    user.wallet -= item_cost;

    await user.save();

    return true;
  }

  // INV
  if (msg[0] == "inv") {
    var message = "Your Items\n\n";
    var inventory = JSON.parse(user.inventory);

    inventory.forEach(function(i, index) {
      message += (index+1) + ". `" + i + "`\n";
    });

    if (inventory.length == 0) {
      message += "You have nothing...";
    }

    data.reply(message);
    return true;
  }

  // USE
  var inventory = JSON.parse(user.inventory);
  var item = msg[1];

  if (inventory.includes(item)) {
    if (item == "health") {
      user.hp = user.max_hp;
      m.remove_inv_item(user, item);
      await user.save();
      data.reply("Your health has been restored to `" + user.max_hp + "`!");
    } else if (item == "brass") {
      if (user.used_brass) {
        data.reply("You've already used Brass Knuckles.");
      } else {
        user.used_brass = true;
        m.remove_inv_item(user, item);

        await user.save();

        data.reply("You've put on your Brass Knuckles. All future attack damage will be doubled.");
      }
    } else if (item == "exp") {
      user.exp += 1;
      m.remove_inv_item(user, item);
      await user.save();

      data.reply("You've gained one experience point!");
    } else if (item == "karma") {
      user.karma = 0;
      m.remove_inv_item(user, item);
      await user.save();

      data.reply("Your karma is back to neutral (aka `0`).");
    } else if (item == "armor") {
      user.max_hp += 50;
      m.remove_inv_item(user, item);
      await user.save();
      data.reply("You've increased your total HP to `" + user.max_hp + "`");
    } else if (item == "strength") {
      user.strength += 1;
      m.remove_inv_item(user, item);
      await user.save();
      data.reply("You've increased your total strength to `" + user.strength + "`");
    }
  } else {
    data.reply("You can't use something you don't own.");
  }

  return true;
}

m.remove_inv_item = function(user, key) {
  var inv = JSON.parse(user.inventory);
  var item_index = inv.indexOf(key);
  inv.splice(item_index, 1);
  user.inventory = JSON.stringify(inv);
}

m.add_inv_item = function(user, key) {
  var inv = JSON.parse(user.inventory);

  // Brass Knuckles can only be used once
  if (key == "brass") {
    if (user.used_brass) {
      return false;
    }

    if (inv.includes(key)) {
      return false;
    }
  }

  inv.push(key);



  user.inventory = JSON.stringify(inv);

  return true;
}

m.has_inv_item = function(user, key) {
  if (user.inventory.includes(key)) {
    return true;
  }

  return false;
}

m.item_cost = function(key) {
  return m.items.find(x => x.key == key).cost;
}

module.exports = m
