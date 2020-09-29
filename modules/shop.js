const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db shop` - Shop for useful items!\n";
m.help += "`db buy X` - Buy item X from shop!\n";
m.help += "`db use X` - Use X item!\n";
m.help += "`db inv` - Show your inventory!\n";
m.help += "`db equip|unquip X` - Equip or unquip an item in your inventory!\n";

m.items = [
  {name: 'Health Pack', desc: 'Restores HP to full.', key: 'health', cost: 1000 },
  {name: 'Brass Knuckles', desc: 'Doubles future attack damage for life.', key: 'brass', cost: 50000 },
  // {name: 'Experience Pack', desc: 'Increases experience level by 1 point.', key: 'exp', cost: 1000 },
  {name: 'Karma Pack', desc: 'Brings karma level up 1 point.', key: 'karma', cost: 5000 },
  {name: 'Armor', desc: 'Gives you an extra 50 hp.', key: 'armor', cost: 1000 },
  {name: 'Strength Juice', desc: 'Increases your strength by 1 point.', key: 'strength', cost: 1000 },
  {name: 'Wooden Sword', desc: 'A wooden sword with **+5** attack damage!', key: 'wooden-sword', cost: 1000, equippable: true, dmg: 5, type: "weapon" },
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

m.valids = ["shop", "buy", "use", "inv", "equip", "unequip"];

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

    if (!item_cost) {
      data.reply("I'm sorry, I have no idea what you're trying to buy.");
      return true;
    }

    // Valid Item...now lets check to make sure the user can afford it
    if (item_cost > user.wallet) {
      data.reply("You can't afford that!");
      return true;
    }

    var item_val;

    m.items.forEach(function(i) {
      if (i.key == item_key) {
        item_val = i;
      }
    });

    // The user can afford it, lets buy it IF they can own it
    var added = m.add_inv_item(user, item_val);

    if (added) {
      data.reply("You've bought one `" + item_key + "`.");
    } else {
      data.reply("Sorry. You can't do that.");
      return true;
    }

    user.wallet -= item_cost;

    await user.save();

    return true;
  }

  // INV
  if (msg[0] == "inv") {
    var message = "Your Items\n\n";
    var inventory = JSON.parse(user.inventory);

    var display_inv = [];

    inventory.forEach(function(i, index) {
      if (!(i.name in display_inv)) {
        display_inv[i.name] = 1;
      } else {
        display_inv[i.name] += 1;
      }
    });

    if (inventory.length == 0) {
      message += "You have nothing...";
    } else {
      message += "__Quantity | Item__\n";

      for (var key in display_inv) {
        var item = inventory.find(x => x.name == key);

        if (item) {
          if (item.equipped) {
            message += (display_inv[key]) + " | `" + key + "` **EQUIPPED**\n";
          } else {
            message += (display_inv[key]) + " | `" + key + "`\n";
          }
        } else {
          message += (display_inv[key]) + " | `" + key + "`\n";
        }
      }
    }

    data.reply(message);
    return true;
  }

  // EQUIP
  if (msg[0] == "equip") {
    var res = m.equip_item(user, msg[1]);

    if (res.ok) {
      await user.save();
    }

    data.reply(res.msg);
    return true;
  }

  // UNEQUIP
  if (msg[0] == "unequip") {
    var res = m.unequip_item(user, msg[1]);

    if (res.ok) {
      await user.save();
    }

    data.reply(res.msg);
    return true;
  }

  // USE
  if (msg[0] == "use") {
    var inventory = JSON.parse(user.inventory);
    var item = msg[1];

    var has_item = false;

    inventory.forEach(function(i) {
      if (i.name == item) {
        has_item = true;
        return;
      }
    });

    if (has_item) {
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
        user.karma += 1;
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
      data.reply("You can't use that, lad! Try `equip` instead or don't bother...");
    }
  }


  return true;
}

m.remove_inv_item = function(user, key) {
  var inv = JSON.parse(user.inventory);

  var index = -1;

  inv.forEach(function(i, x) {
    if (i.name == key) {
      index = x;
    }
  });

  if (index != -1) {
    inv.splice(index, 1);
  }

  user.inventory = JSON.stringify(inv);
}

m.unequip_item = function(user, key) {
  var inv = JSON.parse(user.inventory);

  var item;
  var item_index;

  inv.forEach(function(i, index) {
    if (i.name == key) {
      item = i;
      item_index = index;
      return;
    }
  });

  if (!item) {
    return {ok: false, msg: "You don't even have that in your inventory."};
  }

  if (!item.equippable) {
    return {ok: false, msg: "You can't unequip the unequippable."};
  }

  if (!item.equipped) {
    return {ok: false, msg: "You already have that unequipped!"};
  }

  inv[item_index].equipped = false;

  user.inventory = JSON.stringify(inv);

  return {ok: true, msg: "You've **un-equipped** `" + item.name + "`!"};
}

m.equip_item = function(user, key) {
  var inv = JSON.parse(user.inventory);

  var item;
  var item_index;

  inv.forEach(function(i, index) {
    if (i.name == key) {
      item = i;
      item_index = index;
      return;
    }
  });

  if (!item) {
    return {ok: false, msg: "You don't even have that in your inventory."};
  }

  if (!item.equippable) {
    return {ok: false, msg: "You can't equip that."};
  }

  if (item.equipped) {
    return {ok: false, msg: "You already have that equipped!"};
  }

  inv[item_index].equipped = true;

  user.inventory = JSON.stringify(inv);

  return {ok: true, msg: "You've equipped `" + item.name + "`!"};
}

m.add_inv_item = function(user, i) {
  var inv = JSON.parse(user.inventory);

  // Brass Knuckles can only be used once
  if (i.key == "brass") {
    if (user.used_brass) {
      return false;
    }
  }

  var item = {};
  item.name = i.key;
  item.equipped = false;
  item.equippable = i.equippable;
  item.type = i.type;
  item.dmg = i.dmg;

  inv.push(item);

  user.inventory = JSON.stringify(inv);

  return true;
}

m.has_inv_item = function(user, key) {
  user.inventory.forEach(function(i) {
    if (i.key == key) {
      return true;
    }
  });

  return false;
}

m.item_cost = function(key) {
  var item = m.items.find(x => x.key == key);

  if (item) {
    return item.cost;
  }

  return false;
}

module.exports = m
