const helpers = require("../helpers");
const models = require('../models').db;

require('dotenv').config();

var m = {};

m.help = "`db beg` - Beg people for money!";

m.givers = [
  'Peter Kropotkin', 'Emma Goldman', 'Rudolf Rocker', 'William Godwin',
  'The Man', 'The Dude', 'El Hombre', 'Supermang', 'Superwoman', 'Spidermane',
  'A famous person', 'Your neighbor', 'Your great great grandmother', 'Brian',
  'Karl', 'The Don', 'HoneyBear', 'RandomV3', 'Coolin', 'Joja', 'Rocky', 'Brrl',
  'The universe', 'The law of attraction', 'Your best friend, me', 'Bobby Sands',
  'Lao Tzu', 'Your professor', 'The last avatar', 'Aang', 'Katara', 'Zuko', 'Toph',
  'Harry Otter', 'A bird', 'A cat', 'A dog', 'A hobo', 'A dirty commie', 'A politician',
  'Alan Watts', 'A Zen Master', 'Obama', 'Someone poorer than you', 'A wealty person'
];

m.valid = function(data) {
  const msg = helpers.db.parse_msg(data);
  if (msg[0] != "beg") {
    return false;
  }

  if (global.users[data.author.id].beg_timeout) {
    data.reply("Please wait `30 seconds` inbetween begging...")
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

  // Pick person from list
  const person = m.givers[Math.floor(Math.random() * m.givers.length)];
  const success = Math.floor(Math.random() * 100) < process.env.BEG_CHANCE;

  var message = "`" + person + "`";

  if (success) {
    const amt = 50 + Math.floor(Math.random() * 1000);
    message = message + " gave you `$" + amt + "`!\n";

    user.wallet += amt;
    await user.save();
  } else {
    message = message + " denied you any money. :(";
  }

  data.reply(message);

  var mem_user = global.users[data.author.id];
  mem_user.beg_timeout = true;
  setTimeout(function() {
    mem_user.beg_timeout = false;
  }, 30000);

  return true;
}

module.exports = m
