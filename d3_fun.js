var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1400 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var legend_space = 120,
    shaded = "";

var months = ["Jan",
             "Feb",
              "Mar",
              "Apr", 
              "May", 
              "Jun", 
              "July", 
              "Aug", 
              "Sept", 
              "Oct", 
              "Nov", 
              "Dec"]

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

var format = d3.time.format("%Y-%m-%d"),
    mindate = format.parse("2000-09-15"),
    maxdate = format.parse("2012-05-29");

// setup x 
var xValue1 = function(d) { 
  if (d.founded_at) {
    return +d.founded_at;
    }
    }, // data -> value
    xScale1 = d3.time.scale()
      .domain([mindate, maxdate])
      .range([0, width - legend_space]), // value -> display
    xMap1 = function(d) { return xScale1(xValue1(d));}, // data -> display
    xAxis1 = d3.svg.axis().scale(xScale1).orient("bottom");

// setup y
var yValue1 = function(d) { 
  // console.log(d.name)
  // console.log(d.funding_total_usd)
  if (d.funding_total_usd) {
    return +d.funding_total_usd;
  }}, // data -> value
    yScale1 = d3.scale.linear().range([height, 0]), // value -> display
    yMap1 = function(d) { return yScale1(yValue1(d));}, // data -> display
    yAxis1 = d3.svg.axis().scale(yScale1).orient("left");

// setup fill color
var cValue1 = function(d) { return d.market;},
    color1 = d3.scale.category10();

var title = d3.select("body").append("text")
  .attr("width", width + margin.left + margin.right)
  .attr("height", 75)
  .attr("class", "title")
  .text("Total Funding vs. Age of Company");

// add the graph canvas to the body of the webpage
var svg1 = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("./Companies-Table.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    var int = parseInt(d.funding_total_usd)
    d.funding_total_usd = +int;
    var format = d3.time.format("%Y-%m-%d");
    d.founded_at = format.parse(d.founded_at);
//    console.log(d);
  });

  data = data.filter(function(d) {
    return (d.founded_at && +d.founded_at > 1000000000000 && d.founded_at.getFullYear() < 2016 && d.funding_total_usd);
  })

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale1.domain([d3.min(data, xValue1)-1, d3.max(data, xValue1)+1]);
  yScale1.domain([d3.min(data, yValue1)-1, d3.max(data, yValue1)+1]);

  // x-axis
  svg1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis1)
    .append("text")
      .attr("class", "label")
      .attr("x", (width - legend_space) / 2)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Founding Date");

  // y-axis
  svg1.append("g")
      .attr("class", "y axis")
      .call(yAxis1)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Total Funding (MM USD)");

  // draw dots
  svg1.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", function(d) {
        return d.market;
      })
      .classed("dot", true)
      .attr("r", 3.5)
      .attr("cx", xMap1)
      .attr("cy", yMap1)
      .style("fill", function(d) { return color1(cValue1(d));}) 
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["name"] + "<br/> (" + months[d.founded_at.getMonth()] + " " + d.founded_at.getFullYear() 
	        + ", $" + yValue1(d) + "M)<br/> " + d.city + ", " + d.country_code)
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  // draw legend
  var legend1 = svg1.selectAll(".legend")
      .data(color1.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .on("click", function(d,i) {
        showMarket(d,i);
      });

  // draw legend colored rectangles
  legend1.append("rect")
      .attr("x", width - 110)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color1);

  // draw legend text
  legend1.append("text")
      .attr("x", width - 88)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "beginning")
      .text(function(d) { return d;})
});



var showMarket = function(company, num) {
  if (shaded == company) {
    showAll();
  } else {
    var toHide = d3.selectAll(".dot").filter(function(d) {
     return d.market != company;
    })
    toHide
      .transition()
      .style("opacity", 0)
      .attr("display", "none");
    d3.selectAll("." + company)
      .attr("display", "block")
      .transition()
      .style("opacity", 1);
    shaded = company;
  }
}

var showAll = function() {
  console.log("show all")
  d3.selectAll(".dot")
    .attr("display", "block")
    .transition()
    .style("opacity", 1);
  shaded = "";

}
