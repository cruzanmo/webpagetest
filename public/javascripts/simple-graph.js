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

//create graph element
document.body.innerHTML += '<div id="graph" class="graph"></div>';

// settings
var colRightMargin = 5;
var totalCols = JSONData.length;
var totalHeight = document.getElementById('graph').offsetHeight;
var totalWidth = document.getElementById('graph').offsetWidth;
var colWidth = (totalWidth/(totalCols+1)) - colRightMargin;
var label = "url";
var xAxis = "date";
var yAxis = ["firstByte","firstPaint","titleLoad","docReadyStart","docReadyEnd","docLoadStart","docLoadEnd","loaded","visuallyComplete"];

//get the scale
var maxHeight = 0;
for (var i=0;i<totalCols;i++){
  var colHeight = 0;
  // each bar in the column
  for (var m=0,l2=yAxis.length;m<l2;m++) {
    colHeight += JSONData[i][yAxis[m]];
  }
  if (colHeight>maxHeight) {
    maxHeight = colHeight;
  }
}
var scale = totalHeight/maxHeight;

// add labels to y axis
var labelCount = 10;
var labelIncrement = maxHeight/labelCount;
for(var currentLabel=0;currentLabel<labelCount;currentLabel++) {
  document.getElementById('graph').innerHTML += '<div class="y-label" style="bottom:'+(currentLabel*labelIncrement*scale)+'px;">'+(currentLabel*labelIncrement/1000)+'</div>';
}

//go through the JSONData array
for (var i=0;i<totalCols;i++){

  // add column to the graph
  document.getElementById('graph').innerHTML += '<div id="col-'+i+'" class="col" ' +
    'style="left:'+((i+1)*(colWidth+colRightMargin))+'px;height:' + totalHeight + 'px;width:' + colWidth + 'px;margin-right:' + colRightMargin + 'px;"' +
    '><h1>'+JSONData[i].url+'</h1></div>';
  var colHeight = 0;

  // each bar in the column
  for (var m=0,l2=yAxis.length;m<l2;m++) {
    console.log(JSONData[i][yAxis[m]]);
    var barVal = Math.floor(JSONData[i][yAxis[m]]*scale);
    var barBottom = colHeight;
    document.getElementById('col-'+i).innerHTML += '<div class="bar '+yAxis[m]+'" style="' +
      'bottom:'+barBottom+'px;height:'+barVal+'px;'+
      '"></div>';
    colHeight += barVal;
  }

}

// display the key
var key = '<div class="key">';
for (var i=yAxis.length;i>=0;i--){
  key += '<h2 class="'+yAxis[i]+'">'+yAxis[i]+'</h2>';
}
key += '</div>';
document.body.innerHTML += key;





