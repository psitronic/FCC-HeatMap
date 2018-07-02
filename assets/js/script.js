const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = {top: 200, right: 10, bottom: 100, left: 200},
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
					Temperature: Number.parseFloat(+(d.variance + baseT).toFixed(3)) 
				};
			});
			resolve(data);
		};
	});
});

getData.then((data) => {
	const minYear = d3.min(data, (d) => d.Year);
	const maxYear = d3.max(data, (d) => d.Year);
	const minMonth = d3.min(data, (d) => d.Month);
	const maxMonth = d3.max(data, (d) => d.Month);
	const minTemperature = d3.min(data, (d) => d.Temperature);
	const maxTemperature = d3.max(data, (d) => d.Temperature);
	const gridWidth = Math.floor(width / 262);
	const gridHeight = Math.floor(height / 12);


	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xScale = d3.scaleTime()
					.domain([minYear, maxYear])
					.range([0, width]);

    var yScale = d3.scaleTime()
                    .domain([maxMonth, minMonth])
                    .range([height, 0]);

	var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
	var yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

	svg.append("g")
		.attr("id", "x-axis")
		.attr("class", "axis")
		.attr("transform", "translate(0, " + (height + gridHeight + 7) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("id", "y-axis")
		.attr("class", "axis")
		.attr("transform", "translate(" + -gridWidth / 2 + ", " + gridHeight / 2 + ")")
		.call(yAxis);

    var colorScale = d3.scaleLinear()
    	.domain([minTemperature, buckets - 1, maxTemperature])
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

	var tiles = svg.selectAll("rect")
		.data(data)
		.enter().append("rect")
		.attr("class", "tile")
		.attr("x", (d) => xScale(d.Year - 1))
		.attr("y", (d) => yScale(d.Month - 1))
		.attr("width", gridWidth + 1)
		.attr("height", gridHeight + 5)
		.style("fill", (d) => colorScale(d.Temperature));

})
// .catch((error) => console.log(error));