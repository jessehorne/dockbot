const Discord = require('discord.js');
const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db slots X` - Bet X amount of money in a game of slots!";

m.header = "slot_machine";

m.icons = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten"
];

m.reel = [];

// Put 11 zeros, 10 ones, etc...
for (var i=11; i>0; i--) {
  var choice = 11 - i;
  for (var x=choice; x<12; x++) {
    m.reel.push(m.icons[choice]);
  }
}

m.generate_line = function() {
  var line = [];

  for (var x=0; x<3; x++) {
    const random = Math.floor(Math.random() * m.reel.length);
    line.push(m.reel[random]);
  }

  return line;
}

m.get_win_amt = function(line) {
  var win_amt = 0;

  const points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  line.forEach(function(row) {
    var icon_index = m.icons.indexOf(row);
    points[icon_index] += 1;
  });

  points.forEach(function(point, index) {
    var multiplier;

    if (point == 2) {
      multiplier = 1;
    } else if (point == 3) {
      multiplier = 2;
    }

    if (point >= 2) {
      // console.log("Point:", point, "Index:", index)
      win_amt += (index+1) * multiplier;
    }
  });

  // console.log("Win Amt: ", win_amt);

  return win_amt;
}

m.create_embed = function(bet, formatted_line) {
  const embed = new Discord.MessageEmbed();
  embed.setColor('#e8eb34');
  embed.setTitle(`Slots :${m.header}: :${m.header}: :${m.header}:`);

  var message = "";

  message = "Your Bet - `$" + bet + "`\n";
  message = message + "\n" + formatted_line + "\n";

  embed.addField('Results\n' + message);

  return embed;
}

m.valid = function(data) {
  const msg = helpers.db.parse_msg(data);

  if (msg[0] != "slots") {
    return false;
  }

  if (global.users[data.author.id].slots_timeout) {
    data.reply("Please wait `1 second` inbetween slots.");
    return false;
  }

  if (!msg[1]) {
    data.reply("You didn't include an amount to bet...");
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

  const amt = parseInt(msg[1]);

  if (amt <= 0) {
    data.reply("You're joking, right?");
    return true;
  }

  if (amt > user.wallet) {
    data.reply("You don't have enough money in your wallet for slots!");
    return true;
  }

  const mem_user = global.users[data.author.id];

  // Handle Slots
  var line = m.generate_line();
  var tmp_line = ["X", "Y", "Z"]
  var win_amt = m.get_win_amt(line);

  formatted_line = "";

  for (var x=0; x<line.length; x++) {
    formatted_line = formatted_line + ':' + tmp_line[x] + ":";
    if (x < 2) {
      formatted_line = formatted_line + ' - ';
    }
  }



  // Create Embed
  var embed = m.create_embed(msg[1], "X - Y - Z");

  mem_user.slots_msg = await data.reply("", embed);

  // Send THREE edits

  // first
  setTimeout(function() {
    var formatted_line = `:${line[0]}: - Y - Z`;
    var embed = m.create_embed(msg[1], formatted_line);
    mem_user.slots_msg.edit(embed);
  }, 1000);

  // second
  setTimeout(function() {
    var formatted_line = `:${line[0]}: - :${line[1]}: - Z`;
    var embed = m.create_embed(msg[1], formatted_line);
    mem_user.slots_msg.edit(embed);
  }, 2000);

  // third
  setTimeout(function() {
    var formatted_line = `:${line[0]}: - :${line[1]}: - :${line[2]}:`;

    var message = "";

    if (win_amt <= 0) {
      message = message + "You lost `$" + msg[1] + "`... :(";
    } else {
      message = message + "You win `$" + win_amt + "`!";
    }

    formatted_line += "\n" + message;

    var embed = m.create_embed(msg[1], formatted_line);

    mem_user.slots_msg.edit(embed);
  }, 3000);

  // Timeout for a few seconds
  mem_user.slots_timeout = true;

  setTimeout(function() {
    mem_user.slots_timeout = false;
  }, 1000);

  return true;
}

module.exports = m
