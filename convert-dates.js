"use strict";

var mongoClient = require('mongodb').MongoClient;

// Convert date string to iso date. Current format is like Date.toString(): "Thu, 02 Jan 2014 14:25:27 +0000"
var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function convertToIso(dateString) {
  var newDate = new Date(dateString.substr(12,4),months.indexOf(dateString.substr(8,3)),dateString.substr(5,2),(parseInt(dateString.substr(17,2))-5),dateString.substr(20,2),dateString.substr(23,2));
  var isoDate = newDate.toISOString();
  return isoDate;
}

mongoClient.connect('mongodb://localhost:55555/webpagetest', {}, function(err,db) {

  if (err) throw err;

  // Query mongo for all data
  var cursor = db.collection('results').find();
  // for each, update the date element to isoDate
  cursor.each(function(err,x) {
    if (err) throw err;

    if (x !== null) {
      console.log('old date: '+x.response.data.completed);
      x.response.data.completed = convertToIso(x.response.data.completed);
      db.collection('results').update({'_id':x._id}, x, function(err,saved){
        if (err) throw err;
        console.log('saved.');
      });
      console.log('new date: '+x.response.data.completed);
    }

  });


});
