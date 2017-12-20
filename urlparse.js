#!/usr/bin/env node
var url = require('url');
if (process.argv.length < 3) {
  console.error('Missing URL');
  process.exit(1);
}
var u = process.argv[2];
var part = process.argv.length == 4 ? process.argv[3] : null;
var p = url.parse(u);
var auth = p['auth'];
if (auth) {
  auth = auth.split(':');
} else {
  auth = ['','']
}
p.username = auth[0];
p.password = auth[1];
if (part) {
  console.log(p[part])
} else {
  console.log(p);
}
