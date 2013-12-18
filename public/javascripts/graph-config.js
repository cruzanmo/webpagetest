/* based on http://pothibo.com/2013/09/d3-js-how-to-handle-dynamic-json-data/ */



/*
(function() {
  var data = JSONData.slice();
  var format = d3.time.format("%a %d %b %Y %X %Z");
  //Fri, 06 Dec 2013 19:42:36 +0000
  //https://github.com/mbostock/d3/wiki/Time-Formatting#wiki-parse

  var amountFn = function(d) { return d.visuallyComplete };
  var dateFn = function(d) { return format.parse(d.date.replace(',','')) };

  var x = d3.time.scale()
    .range([10, 280])
    .domain(d3.extent(data, dateFn));

  var y = d3.scale.linear()
    .range([180, 10])
    .domain(d3.extent(data, amountFn));

  var svg = d3.select("#demo").append("svg:svg")
    .attr("width", 300)
    .attr("height", 200);

  svg.selectAll("circle").data(data).enter()
    .append("svg:circle")
    .attr("r", 4)
    .attr("cx", function(d) { return x(dateFn(d)) })
    .attr("cy", function(d) { return y(amountFn(d)) });
})();
*/




var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
  .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
  .rangeRound([height, 0]);

var color = d3.scale.ordinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00", "#4eff41", "#2bcab9", "#ff1cf7"]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");





var data = JSONData;


var format = d3.time.format("%a %d %b %Y %X %Z");
//Fri, 06 Dec 2013 19:42:36 +0000
//https://github.com/mbostock/d3/wiki/Time-Formatting#wiki-parse
var dateFn = function(d) { return format.parse(d.date.replace(',','')) };

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

//color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));
color.domain(['firstByte','firstPaint','titleLoad','docReadyStart','docReadyEnd','domContentLoadedEventEnd','docLoadStart','docLoadEnd','loaded','visuallyComplete']);

data.forEach(function(d) {
  var y0 = 0;
  d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
  d.total = d.ages[d.ages.length - 1].y1;
});

data.sort(function(a, b) { return b.total - a.total; });

x.domain(data.map(function(d) { return d.State; }));
y.domain([0, d3.max(data, function(d) { return d.total; })]);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Miliseconds");

var state = svg.selectAll(".state")
  .data(data)
  .enter().append("g")
  .attr("class", "g")
  .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

state.selectAll("rect")
  .data(function(d) { return d.ages; })
  .enter().append("rect")
  .attr("width", x.rangeBand())
  .attr("y", function(d) { return y(d.y1); })
  .attr("height", function(d) { return y(d.y0) - y(d.y1); })
  .style("fill", function(d) { return color(d.name); });

var legend = svg.selectAll(".legend")
  .data(color.domain().slice().reverse())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color);

legend.append("text")
  .attr("x", width - 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d) { return d; });


