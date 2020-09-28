const helpers = require("../helpers");
const models = require('../models').db;

require('dotenv').config();

var m = {};

m.help = "`db beg` - Beg people for money!";

m.givers = [
  'Maurice Blackbeard', 'Kind Stephie Red', 'Understanding Maury', 'Cutthroad Stephie',
  'Jim the Kind', 'Rosey Greyhate', 'The Red Parrot', 'Dread Thomas', 'Captain Billiam',
  'Captain Johnny', 'Bobby Pirate', 'Moose', 'Bones Daniel', 'Black Flag Billy', 'Captain Jack',
  'William Lionbane', 'Patrick Nofoot', 'Woodenleg Jones', 'Red Beard', 'Blue Beard', 'Black Beard',
  'Sir Francis', 'Captain Drake', 'Henry Morgan', 'Captain Kidd', 'Madame Cheng'
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
