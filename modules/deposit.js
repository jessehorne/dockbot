const helpers = require("../helpers");
const models = require('../models').db;

var m = {};

m.help = "`db deposit|dep X` - Deposits X from your wallet to your bank!\n";
m.help += "`db withdraw X` - Withdraw X from your bank to your wallet!";
m.valids = ['withdraw'];

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

  if (['deposit', 'dep'].includes(msg[0])) {
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

    data.reply("You've deposited `$" + helpers.db.format_money(amt) + "` into your bank account!");
  } else if (['withdraw'].includes(msg[0])) {
    // Get Amount
    const amt = parseInt(msg[1]);

    if (amt > user.bank) {
      data.reply("You don't have that much in your bank.");
      return false;
    }

    if (amt <= 0) {
      return false;
    }

    user.wallet += amt;
    user.bank -= amt;

    data.reply("You've withdrawn `$" + helpers.db.format_money(amt) + "` into your wallet!");
  }

  await user.save();

  return true;
}

module.exports = m
