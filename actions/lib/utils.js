

var allowParams = function(paramsList, msg) {
  var obj = {};
  for(var i in paramsList) {
    var p = paramsList[i];
    if (typeof msg[p] !== 'undefined') {
      obj[p] = msg[p];
    }
  }
  return obj;
};

var removeOpenWhiskParams = function(msg) {
  delete msg.__ow_method;
  delete msg.__ow_headers;
  delete msg.__ow_path;
  delete msg.COUCH_HOST;
  delete msg.COUCH_DATABASE;
  delete msg.SLACK_TOKEN;
  delete msg.APP_URL;
  delete msg.cookie;
  return msg;
};

var reply = function(data, contentType) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': contentType || 'application/json' },
    body: data
  };
};

var error = function(data) {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'application/json' },
    body: data
  };
}

module.exports = {
  allowParams: allowParams,
  removeOpenWhiskParams: removeOpenWhiskParams,
  reply: reply,
  error: error
};

