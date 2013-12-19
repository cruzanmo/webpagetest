"use strict";
var mongoClient = require('mongodb').MongoClient;

console.log('The script ran from launchd.');

var fullPath = __dirname;
console.log(fullPath);

var testDate = new Date();
console.log('Webpagetest initiated at ' + testDate.getHours() + ' on ' + testDate.getFullYear() + '-' + testDate.getMonth() + '-' + testDate.getDate() );

/*
mongoClient.connect('mongodb://localhost:55555/webpagetest', {}, function(err,db) {
  if (err) throw err;
  else console.log('connected to mongodb.');
  db.close();
});*/
