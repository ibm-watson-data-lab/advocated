const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');

const main = function(msg) {
  
  // cloudant
  const db = cloudant.configure(msg.COUCH_HOST, 'tokens');

  if (msg.cookie) {
    return db.get(msg.cookie).then(function(data) {
      return utils.reply({ok: true});
    }).catch(function(e) {
      return utils.error({ok: false});
    });
  } else {
    return utils.error({ok: false});
  }
  
};

exports.main = main;