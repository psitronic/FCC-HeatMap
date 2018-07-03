const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = {top: 200, right: 10, bottom: 150, left: 200},
	width = 1900 - margin.left - margin.right,
	height = 800 - margin.top - margin.bottom
	buckets = 11;
const parseYear = d3.timeParse("%Y");
const parseMonth = d3.timeParse("%m");

const getData = new Promise((resolve, reject) => {
	d3.json(dataUrl, (error, dataset) => {
		if (error) {
			reject(error);
		} else {

			const baseT = dataset.baseTemperature;

			let data = dataset.monthlyVariance.map((d) => {
				return {
					Year: parseYear(+d.year),
					Month: parseMonth(+d.month),
					Temperature: Number.parseFloat(+(d.variance + baseT).toFixed(3)),
					Variance: +d.variance
				};
			});
			resolve({Base: baseT, dataset: data});
		};
	});
});

getData.then((data) => {
	console.log(data);

	const minYear = d3.min(data.dataset, (d) => d.Year);
	const maxYear = d3.max(data.dataset, (d) => d.Year);

	const gridWidth = Math.floor(width / 262);
	const gridHeight = Math.floor(height / 12);


	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xScale = d3.scaleTime()
		.domain(d3.extent(data.dataset, (d) => d.Year))
		.range([0, width]);

    var yScale = d3.scaleTime()
        .domain(d3.extent(data.dataset, (d) => d.Month).reverse())
        .range([height, 0]);

    var colorScale = d3.scaleLinear()
    	.domain(d3.extent(data.dataset, (d) => d.Temperature))
		.range(["blue", "yellow"]);


	var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
	var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

	svg.append("g")
		.attr("id", "x-axis")
		.attr("class", "axis")
		.attr("transform", "translate("+ gridWidth/2 + ", " + (height + gridHeight + 7) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("id", "y-axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + -gridWidth / 2 + ", " + gridHeight / 2 + ")")
		.call(yAxis);

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", - height/2)
		.attr("y", -65)
		.style("text-anchor", "middle")
		.text("Months")
		.attr("class", "axisTitle");

	svg.append("text")
		.attr("x", (width)/2)
		.attr("y", height + gridHeight + 50)
		.style("text-anchor", "middle")
		.text("Years")
		.attr("class", "axisTitle");

	svg.append("text")
		.attr("id", "title")
		.attr("x", (width / 2))
		.attr("y", 0 - (margin.top / 2))
		.attr("text-anchor", "middle")
		.text("Monthly Global Land-Surface Temperature")
		.attr("class", "title");

	svg.append("text")
		.attr("id", "description")
		.attr("x", (width / 2))
		.attr("y", 30 - (margin.top / 2))
		.attr("text-anchor", "middle")
		.text(d3.timeFormat("%Y")(minYear) + " - " + d3.timeFormat("%Y")(maxYear) + ": base temperature " + data.Base + "°C")
		.attr("class", "description");

	var tiles = svg.selectAll("rect")
		.data(data.dataset)
		.enter().append("rect")
		.attr("class", "cell")
		.attr("data-month", (d) => d3.timeFormat("%-m")(d.Month) - 1)
		.attr("data-year", (d) => d3.timeFormat("%Y")(d.Year))
		.attr("data-temp", (d) => d.Temperature)
		.attr("x", (d) => xScale(d.Year - 1))
		.attr("y", (d) => yScale(d.Month - 1))
		.attr("width", gridWidth + 1)
		.attr("height", gridHeight + 6)
		.style("fill", (d) => colorScale(d.Temperature));

  var legend = svg.selectAll(".legend")
      .data(colorScale.ticks(12))
    .enter().append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", (d, i) => "translate(" + (20 + i * 48) + "," + (height + 100) + ")");

  legend.append("rect")
      .attr("width", 48)
      .attr("height", 48)
      .style("fill", colorScale);

  legend.append("text")
      .attr("x", 26)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text(String);

})
// .catch((error) => console.log(error));