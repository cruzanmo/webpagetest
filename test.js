"use strict";
var mongoClient = require('mongodb').MongoClient;

console.log('The script ran from launchd.');

var fullPath = __dirname;
console.log(fullPath);

/*
mongoClient.connect('mongodb://localhost:55555/webpagetest', {}, function(err,db) {
  if (err) throw err;
  else console.log('connected to mongodb.');
  db.close();
});*/
