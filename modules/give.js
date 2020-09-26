const helpers = require("../helpers");
const models = require("../models").db;

var m = {};

m.help = "`db give @user X` - Give another user X coins from your wallet!";

m.valid = function(data) {
  if (data[0] != "give") {
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

  // Get mentioned mem user
  var mention_id = data.mentions.users.first();

  if (!mention_id) {
    data.reply("You didn't mention anyone to give the money to...");
    return true;
  }

  mention_id = mention_id.id;

  if (mention_id == user.discord_id) {
    data.reply("You can't give money to yourself. Sorry...");
    return true;
  }

  if (!global.users[mention_id]) {
    data.reply("Sorry, I don't know that user.");
    return true;
  }
  var mention_mem_user = global.users[mention_id];

  // Get amount
  const amt = parseInt(msg[2]);

  if (!amt) {
    data.reply("That's not a valid number!");
    return true;
  }

  if (amt <= 0) {
    data.reply("You're kidding, right?");
    return true;
  }

  if (amt > user.wallet) {
    data.reply("You don't have that much in your wallet to give.");
    return true;
  }

  // get mentioned db user
  var mention_user = await models.User.findOne({
    where: {
      discord_id: mention_id
    }
  });

  if (mention_user) {
    mention_user.wallet += amt;
    await mention_user.save();

    user.wallet -= amt;
    await user.save();

    data.reply("You gifted " + msg[1] + " `$" + amt + "`!");
    return true;
  }

  data.reply("I'm sorry. Something went wrong.");

  return true;
}

module.exports = m
