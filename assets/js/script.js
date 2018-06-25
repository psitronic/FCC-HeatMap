const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const getData = new Promise((resolve, reject) => {
	d3.json(dataUrl, (error, dataset) => {
		if (error) {
			reject(error);
		} else {
			resolve(dataset);
		};
	});
});

getData.then((data) => {
	console.log(data);
})
.catch((error) => console.log(error));