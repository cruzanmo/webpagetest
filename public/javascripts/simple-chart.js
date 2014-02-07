/* Simple Graph JS, 2014 Morgan Croney, New York Media */

/*
 date: '$response.data.completed',
 url: '$response.data.testUrl',
 firstByte: '$response.data.run.firstView.results.TTFB',
 firstPaint: '$response.data.run.firstView.results.firstPaint',
 titleLoad: '$response.data.run.firstView.results.titleTime',
 docReadyStart: '$response.data.run.firstView.results.domContentLoadedEventStart',
 docReadyEnd: '$response.data.run.firstView.results.domContentLoadedEventEnd',
 docLoadStart: '$response.data.run.firstView.results.loadEventStart',
 docLoadEnd: '$response.data.run.firstView.results.loadEventEnd',
 loaded: '$response.data.run.firstView.results.fullyLoaded',
 visuallyComplete: '$response.data.run.firstView.results.VisuallyCompleteDT'
 */

//{"date":"2013-12-04T16:41:49.000Z","url":"http://nymag.com","firstByte":122,"firstPaint":283,"titleLoad":236,"docReadyStart":1760,"docReadyEnd":1879,"docLoadStart":3721,"docLoadEnd":3722,"loaded":4396,"visuallyComplete":4425}

//last query date
var d = new Date(JSONData[JSONData.length-1].date);
var today = new Date();
document.body.innerHTML += '<h1>Pages last tested on ' + d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() +
  ((d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate() )?' (Today)':'') +
  '</h1>';

//create table element
var table = '<table cellpadding="3">';
var headings = '<tr style="background:lightgrey;"><td>Date</td><td>Page</td><td>Load Time</td><td>Requests</td><td>Bytes</td></tr>';
var current = '';
for (var i=0, l=JSONData.length; i<l; i++) {
  // Add headings above each brand
  if (JSONData[i].pageBrand !== current) {
    table += headings;
  }
  current = JSONData[i].pageBrand;
  // Highlight most recent results
  table += (JSONData[i].date.substr(0,10) === JSONData[JSONData.length-1].date.substr(0,10) ? '<tr style="background:palegreen; font-weight:bold;">' : '<tr>');
  table += '<td>' + JSONData[i].date + '</td><td>' + JSONData[i].pageBrand + ' ' + JSONData[i].pageType + '</td><td>' + JSONData[i].docComplete + '</td><td>' + JSONData[i].requestsDoc + '</td><td>' + JSONData[i].bytesInDoc + '</td></tr>';
}
table += '</table>';
document.body.innerHTML += table;