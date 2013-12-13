/* based on http://pothibo.com/2013/09/d3-js-how-to-handle-dynamic-json-data/ */

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

