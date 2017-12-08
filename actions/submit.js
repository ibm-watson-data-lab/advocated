const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');

const main = function(msg) {
  
  // cloudant
  const tokensdb = cloudant.configure(msg.COUCH_HOST, 'tokens');
  const db = cloudant.configure(msg.COUCH_HOST, msg.COUCH_DATABASE);
  
  // no cookie, no entry
  if (msg.cookie) {

    // load cookie data
    return tokensdb.get(msg.cookie).then(function(data) {
      msg = utils.removeOpenWhiskParams(msg);

      // add user details
      msg.team_id = data.team_id;
      msg.user_id = data.user_id;
      msg.user_name = data.user_name;

      // remove empty fields
      if (!msg._id) {
        delete msg._id;
      }
      if (!msg._rev) {
        delete msg._rev;
      }

      // add to database
      return db.insert(msg);
    }).then(function(data) {
      // return the id,rev,ok:true
      return utils.reply(data);
    }).catch(function(e) {
      // bad cookie or other error
      return utils.error({ok: false, err: e});
    });
  } else {
    // missing cookie
    return utils.error({ok: false, err: 'not authorised'});
  }
  
};

exports.main = main;