require('dotenv').config();

const models = require('./models').db;
const helper = require('./helpers');
const modules = require('./modules');

const Discord = require('discord.js');
const dockbot = new Discord.Client();

if (process.env.APP_DEBUG) {
  models.sequelize.sync({ force: true });
}

global.users = [];
var helps = [];

modules.forEach(function(m) {
  helps.push(m.help);
});

// Login the bot
dockbot.login(process.env.DISCORD_BOT_TOKEN);

// Listen for events

// Login Successful
dockbot.on('ready', () => {
  console.info(`Logged in as ${dockbot.user.tag}...`);
});

// On Message
dockbot.on('message', async function (msg) {
  // If it's my own message, ignore!
  var who = msg.author.id;

  if (who == process.env.DISCOD_ID) {
    return;
  }

  // Determine if message is for me
  var me = msg.content.substr(0, 2);

  var can_pass = false;

  modules.forEach(function(m) {
    if (m.pass(msg)) {
      can_pass = true;
      return;
    }
  });

  var db_user;

  if (me !== process.env.DISCORD_ME && can_pass == false) {
    return;
  } else {
    // It's for ME! I need to keep track of timeout
    var user = global.users[msg.author.id];

    if (user === undefined) {
      global.users[msg.author.id] = {};
      global.users[msg.author.id].can_talk = false;
      user = global.users[msg.author.id];

      setTimeout(function() {
        user.can_talk = true;
      }, user.waittime*1000);
    } else {
      if (!user.can_talk) {
        msg.reply("Slow down!");
        return;
      } else {
        user.can_talk = false;

        setTimeout(function() {
          user.can_talk = true;
        }, user.waittime*1000);
      }
    }

    // I also need to keep track of if the user is registered or not in the DB!
    db_user = await models.User.findOne({
      where: {
        discord_id: msg.author.id
      }
    });

    if (!db_user) {
      // CREATE USER!
      db_user = await models.User.create({
        name: msg.author.username,
        discord_id: msg.author.id,
        karma: 0,
        exp: 0,
        wallet: 1000,
        bank: 0,
        total_commands: 1,
        waittime: process.env.WAITTIME,
        hp: 100
      });
    }

    if (db_user) {
      db_user.total_commands += 1;
      db_user.save();
    }
  }

  // Ready to handle message!
  var good = false;

  modules.forEach(function(m) {

    const ok = m.handle(msg, db_user, can_pass);

    if (ok) {
      good = true;
      return;
    }
  });

  if (helper.db.parse_msg(msg)[0] == 'help') {
    msg.reply("", helper.db.help(helps));
    return;
  }

  // If it gets here, I have no idea what you're saying
  if (!good) {
    msg.reply("I do not understand. Please use `db help`.");
  }
});
