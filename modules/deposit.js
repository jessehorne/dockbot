const helpers = require("../helpers");
const models = require('../models').db;

var m = {};

m.help = "`db deposit|dep X` - Deposits X from your wallet to your bank!";

m.valids = ['deposit', 'dep'];

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

  // Get Amount
  const amt = parseInt(msg[1]);

  if (amt > user.wallet) {
    data.reply("You don't have that much in your wallet.");
    return false;
  }

  if (amt <= 0) {
    return false;
  }

  user.wallet -= amt;
  user.bank += amt;
  await user.save();

  data.reply("You've deposited `$" + amt + "` into your bank account!");


  return true;
}

module.exports = m
