const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = {top: 200, right: 10, bottom: 150, left: 200},
	width = 1900 - margin.left - margin.right,
	height = 750 - margin.top - margin.bottom
	buckets = 11;
const parseYear = d3.timeParse("%Y");
const parseMonth = d3.timeParse("%m");
const legenBoxSize = 48;

const getData = new Promise((resolve, reject) => {
	d3.json(dataUrl, (error, dataset) => {
		if (error) {
			reject(error);
		} else {

			const baseT = dataset.baseTemperature;

			let data = dataset.monthlyVariance.map((d) => {
				return {
					Year: parseYear(+d.year),
					Month: (+d.month - 1),
					Temperature: Number.parseFloat(+(d.variance + baseT).toFixed(3)),
					Variance: +d.variance
				};
			});
			resolve({Base: baseT, dataset: data});
		};
	});
});

getData.then((data) => {

	const minYear = d3.min(data.dataset, (d) => d.Year);
	const maxYear = d3.max(data.dataset, (d) => d.Year);

	const gridWidth = width / 262;
	// const gridHeight = Math.floor(height / 12);


	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip")
		.style("opacity", 0);

	var xScale = d3.scaleTime()
		.domain(d3.extent(data.dataset, (d) => d.Year))
		.range([0, width]);

    var yScale = d3.scaleBand()
        .domain([0,1,2,3,4,5,6,7,8,9,10,11])
        .range([0, height]);

        console.log(yScale.bandwidth(),yScale.range(),yScale.domain());
        console.log(height/12);

    var colorScale = d3.scaleLinear()
    	.domain(d3.extent(data.dataset, (d) => d.Temperature))
		.range(["blue", "yellow"]);


	var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
	var yAxis = d3.axisLeft(yScale).tickValues(yScale.domain()).tickFormat(month => {
		var date = new Date();
		
		return d3.timeFormat("%B")(date.setUTCMonth(month));

});

	svg.append("g")
		.attr("id", "x-axis")
		.attr("class", "axis")
		.attr("transform", "translate(0, " + (height) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("id", "y-axis")
		.attr("class", "axis")
		.call(yAxis);

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", - height/2)
		.attr("y", -100)
		.style("text-anchor", "middle")
		.text("Months")
		.attr("class", "axisTitle");

	svg.append("text")
		.attr("x", (width)/2)
		.attr("y", height + 75)
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
		.attr("y", 50 - (margin.top / 2))
		.attr("text-anchor", "middle")
		.text(d3.timeFormat("%Y")(minYear) + " - " + d3.timeFormat("%Y")(maxYear) + ": base temperature " + data.Base + "°C")
		.attr("class", "description");

	var tiles = svg.selectAll("rect")
		.data(data.dataset)
		.enter().append("rect")
		.attr("class", "cell")
		.attr("data-month", (d) => d.Month)
		.attr("data-year", (d) => d3.timeFormat("%Y")(d.Year))
		.attr("data-temp", (d) => d.Temperature)
		.attr("x", (d) => xScale(d.Year))
		.attr("y", (d) => yScale(d.Month))
		.attr("width", gridWidth)
		.attr("height", (d) => yScale.bandwidth())
		.style("fill", (d) => colorScale(d.Temperature))
		.on("mouseover", function(d) {
			div.transition()
			.duration(200)
			.style("opacity", .9);
			div
			.html(d3.timeFormat("%Y")(d.Year) + " - " + d3.timeFormat("%B")(d.Month) + "<br/>" + d.Temperature + "°C" + "<br/>" + d.Variance + "°C")
        	.attr('data-year', d3.timeFormat("%Y")(d.Year))
			.style("left", (d3.event.pageX + 23) + "px")
			.style("top", (d3.event.pageY - 23) + "px");
			})
		.on("mouseout", function(d) {
			div.transition()
			.duration(500)
			.style("opacity", 0);
		});
		;

	var legend = svg.selectAll(".legend")
		.data(colorScale.ticks(12))
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("id", "legend")
		.attr("transform", (d, i) => "translate(" + (20 + i * legenBoxSize) + "," + (height + 85) + ")");

	legend.append("rect")
		.attr("width", legenBoxSize)
		.attr("height", legenBoxSize)
		.style("fill", colorScale);

	legend.append("text")
		.attr("x", 26)
		.attr("y", 58)
		.attr("dy", ".35em")
		.text(String);

})
// .catch((error) => console.log(error));