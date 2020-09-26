const helpers = require("../helpers");

var m = {};

m.help = "`db ping` - Ping...Pong!";

m.valid = function(data) {
  if (data[0] != "ping") {
    return false;
  }

  return true;
}

m.pass = function(data) {
  return false;
}

m.handle = function(data, user=null) {
  // Validate
  const msg = helpers.db.parse_msg(data);
  if (!m.valid(msg)) {
    return false;
  }

  // Run it!
  data.reply("pong!");

  return true;
}

module.exports = m
