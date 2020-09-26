const helpers = require("../helpers");
const models = require('../models').db;

const areas = [
  'cabin', 'lodge', 'house', 'room', 'garage', 'closet', 'porch', 'attic', 'stairway',
  'road', 'sidewalk', 'railroad', 'interstate', 'highway', 'dumpster', 'bench', 'chair',
  'bushes', 'tree', 'forest', 'hillside', 'mountains',
  'northside', 'southside', 'eastside', 'westside', 'uptown', 'downtown', 'bar', 'circus',
  'boat', 'ship', 'ocean', 'pond', 'beach',
  'car', 'truck', 'jeep', 'mazda',
  'northern air temple', 'southern air temple', 'fire nation', 'water tribe',
];

const chance = process.env.SEARCH_CHANCE

function generate_areas() {
  var a = [];

  while (a.length < 3) {
    const random = areas[Math.floor(Math.random() * areas.length)];

    if (!a.includes(random)) {
      a.push(random);
    }
  }

  return a;
}

var m = {};

m.help = "`db search|s` - Search in an area for coins!";

m.valids = ['search', 's'];

m.valid = function(data) {
  const msg = helpers.db.parse_msg(data);
  if (!m.valids.includes(msg[0])) {
    return false;
  }

  if (global.users[data.author.id].search_timeout) {
    data.reply("Please wait `30 seconds` inbetween searches.");
    return false;
  }

  return true;
}

m.pass = function(data) {
  var mem_user = global.users[data.author.id];

  if (mem_user) {
    if (mem_user.searching) {
      return true;
    }
  }

  return false;
}

m.handle = async function(data, user=null, passing=false) {
  // Validate
  const msg = helpers.db.parse_msg(data);
  if (!m.valid(data) && !passing) {
    return false;
  }

  var mem_user = global.users[data.author.id];

  if (!mem_user) {
    return false;
  }

  if (mem_user.searching) {
    if (mem_user.search_answers.includes(data.content)) {
      // USER LOOKS IN VALID AREA
      mem_user.searching = false;

      var win = (Math.random() * 100) <= chance;
      var amt = 0;

      if (win) {
        amt = 100 + Math.floor(Math.random() * 1000);
        user.wallet += amt;
        user.save();
      }

      message = "You found " + amt + " coins";

      if (amt > 0) {
        message += "!";
      } else {
        message += "... Better luck next time!";
      }

      data.reply(message);
    } else {
      // USER LOOKS IN INVALID AREA
      data.reply("That area isn't on the list...Try again next time.");
      mem_user.searching = false;
    }
  } else {
    var search_areas = generate_areas();

    mem_user.searching = true;
    mem_user.search_answers = search_areas;

    mem_user.search_timeout = true;
    setTimeout(function() {
      mem_user.search_timeout = false;
    }, 30000);

    var message = "Which area would you like to look?\n";

    search_areas.forEach(function(item, index) {
      message = message + '`' + item + '`';
      if (index < 2) {
        message = message + ", ";
      }
    });

    data.reply(message);
  }

  return true;
}

module.exports = m
