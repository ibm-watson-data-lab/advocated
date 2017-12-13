const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');

const main = function(msg) {
  
  // cloudant
  const db = cloudant.configure(msg.COUCH_HOST, 'tokens');
  console.log(msg, msg);
  if (msg.token === msg.SLACK_TOKEN && msg.team_id && msg.user_id && msg.user_name) {
    var obj = { 
      team_id: msg.team_id, 
      user_id: msg.user_id, 
      user_name: msg.user_name, 
      ts: (new Date()).getTime()
    };
    return db.insert(obj).then(function(data) {
      return utils.reply('Welcome to `/advocated`! Please login with ' + msg.APP_URL + '/login.html#' + data.id, 'text/plain')
    })
  } else {
    return utils.error('oh no. something went wrong', 'text/plain')
  }
  
};

exports.main = main;