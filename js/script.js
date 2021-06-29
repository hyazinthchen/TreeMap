

mapboxgl.accessToken = 'pk.eyJ1IjoiaHlhemludGhjaGVuIiwiYSI6ImNrbm9vYnljNTBjOWkyb253aWxiOWFpM2UifQ.dqJWj4PrzKlmyTzOE24IKg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hyazinthchen/ckomydj4x64pw17p9ite2mwnz',
    center: [13.74381, 51.05246],
    zoom: 12.5
});

map.on('click', function(e) {
	hideAllInfo();
    document.getElementById("info").classList.remove("hidden");
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['trees']
    });

    if (!features.length) {
        return;
    }

    var feature = features[0];

    var species = "unbekannt";
    if (feature.properties.species != "") {
        species = feature.properties.species;
    }
	document.getElementById("species").innerHTML = species;
	
    var circumference = "unbekannt";
    if (feature.properties.circumference != 0) {
        circumference = feature.properties.circumference;
    }
	document.getElementById("circumference").innerHTML = circumference;
	
	var age = "unbekannt";
    if (feature.properties.age != 0) {
        age = feature.properties.age;
    }
	document.getElementById("age").innerHTML = age;
	
	get30DayPrecipitation(e.lngLat.lat, e.lngLat.lng);
	getForecast(e.lngLat.lat, e.lngLat.lng);
});

map.on('mouseenter', 'trees', function (e) {
	map.getCanvas().style.cursor = 'pointer';
});
 
map.on('mouseleave', 'trees', function () {
	map.getCanvas().style.cursor = '';
});

function hideAllInfo() {
  document.getElementById("info").classList.add("hidden");
  document.getElementById("treeStatistics").classList.add("hidden");
  document.getElementById("treeStatisticsNav").classList.remove("active");
  document.getElementById("weatherStatisticsNav").classList.remove("active");
  document.getElementById("weatherStatistics").classList.add("hidden");
  document.getElementById("howToWaterNav").classList.remove("active");
  document.getElementById("howToWater").classList.add("hidden");
  document.getElementById("legalNav").classList.remove("active");
  document.getElementById("legal").classList.add("hidden");
}

async function get30DayPrecipitation(latitude, longitude) {
	let newDate = new Date();
	let today = new Date(newDate);
	var dates = [];
	var precipitationSums = [];
	
	for (let i = 0; i < 30; i++) {
		today.setDate(today.getDate()-1);
		
		let date = today.toISOString().slice(0, 10);
		dates.push(date);
		let url = "https://api.brightsky.dev/weather?lat=" + latitude + "&lon=" + longitude + "&date=" + date;
		
			await $.getJSON(url, function(data) {
				let precipitationSum = 0;
				for (var hour, i = 0; hour = data.weather[i++];) {
					precipitationSum = precipitationSum + hour.precipitation;
				}
				precipitationSums.push(precipitationSum);
			});
	}
	
	dates.reverse();
	precipitationSums.reverse();
	
	await $('#precipitation-chart').remove();
	await $('#precipitation-chart-container').append('<canvas id="precipitation-chart"><canvas>');
	
	var ctx = document.getElementById('precipitation-chart').getContext('2d');

	var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: dates,
        datasets: [{
            label: 'Tagesniederschlag in mm',
            data: precipitationSums,
			backgroundColor: 'rgba(54, 162, 235, 0.8)'
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
	});
}

function getForecast(latitude, longitude) {
	let today = new Date();
	let dateToday = today.toISOString().slice(0, 10);
	let todayUrl = "https://api.brightsky.dev/weather?lat=" + latitude + "&lon=" + longitude + "&date=" + dateToday;

	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };	
	document.getElementById("forecast-date-1").innerHTML = "für heute, " + today.toLocaleDateString('de-DE', options);
		
	$.getJSON(todayUrl, function(data) {
		document.getElementById("weather-icon-1-1").innerHTML = mapWeatherIcons(data.weather[4].icon);
		document.getElementById("precipitation-1-1").innerHTML = data.weather[4].precipitation + " mm/h";
		document.getElementById("weather-icon-1-2").innerHTML = mapWeatherIcons(data.weather[8].icon);
		document.getElementById("precipitation-1-2").innerHTML = data.weather[8].precipitation + " mm/h";
		document.getElementById("weather-icon-1-3").innerHTML = mapWeatherIcons(data.weather[12].icon);
		document.getElementById("precipitation-1-3").innerHTML = data.weather[12].precipitation + " mm/h";
		document.getElementById("weather-icon-1-4").innerHTML = mapWeatherIcons(data.weather[16].icon);
		document.getElementById("precipitation-1-4").innerHTML = data.weather[16].precipitation + " mm/h";
		document.getElementById("weather-icon-1-5").innerHTML = mapWeatherIcons(data.weather[20].icon);
		document.getElementById("precipitation-1-5").innerHTML = data.weather[20].precipitation + " mm/h";
	});
	
	let tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate()+1);
	let dateTomorrow = tomorrow.toISOString().slice(0, 10);
	let tomorrowUrl = "https://api.brightsky.dev/weather?lat=" + latitude + "&lon=" + longitude + "&date=" + dateTomorrow;

	document.getElementById("forecast-date-2").innerHTML = "für morgen, " + tomorrow.toLocaleDateString('de-DE', options);
		
	$.getJSON(tomorrowUrl, function(data) {
		document.getElementById("weather-icon-2-1").innerHTML = mapWeatherIcons(data.weather[4].icon);
		document.getElementById("precipitation-2-1").innerHTML = data.weather[4].precipitation + " mm/h";
		document.getElementById("weather-icon-2-2").innerHTML = mapWeatherIcons(data.weather[8].icon);
		document.getElementById("precipitation-2-2").innerHTML = data.weather[8].precipitation + " mm/h";
		document.getElementById("weather-icon-2-3").innerHTML = mapWeatherIcons(data.weather[12].icon);
		document.getElementById("precipitation-2-3").innerHTML = data.weather[12].precipitation + " mm/h";
		document.getElementById("weather-icon-2-4").innerHTML = mapWeatherIcons(data.weather[16].icon);
		document.getElementById("precipitation-2-4").innerHTML = data.weather[16].precipitation + " mm/h";
		document.getElementById("weather-icon-2-5").innerHTML = mapWeatherIcons(data.weather[20].icon);
		document.getElementById("precipitation-2-5").innerHTML = data.weather[20].precipitation + " mm/h";
	});
}

function mapWeatherIcons(brightSkyIcon){
	let weatherIconClass;
	switch (brightSkyIcon) {
	  case "clear-day":
		weatherIconClass = "wi-day-sunny";
		break;
	  case "clear-night":
		weatherIconClass = "wi-night-clear";
		break;
	  case "partly-cloudy-day":
		 weatherIconClass = "wi-day-cloudy";
		break;
	  case "partly-cloudy-night":
		weatherIconClass = "wi-night-alt-cloudy";
		break;
	  case "cloudy":
		weatherIconClass = "wi-cloudy";
		break;
	  case "fog":
		weatherIconClass = "wi-fog";
		break;
	  case "wind":
		weatherIconClass = "wi-strong-wind";
		break;
	  case "rain":
		weatherIconClass = "wi-rain";
		break;
	  case "sleet":
		weatherIconClass = "sleet";
		break;
	  case "snow":
		weatherIconClass = "wi-snow";
		break;
	  case "hail":
		weatherIconClass = "wi-hail";
		break;
	  case "thunderstorm":
		weatherIconClass = "wi-thunderstorm";
		break;
	}
	return '<i class="wi ' + weatherIconClass + '"></i>';
}

async function displayCurrentYearWeather() {
	let newDate = new Date();
	let today = new Date(newDate);
	var dates = [];
	var precipitationSums = [];
	var temperatureAverages = [];
	document.getElementById('current-year').innerHTML = today.getFullYear();
	
	for (let i = 0; i < 30; i++) {
		today.setDate(today.getDate()-1);
		
		let date = today.toISOString().slice(0, 10);
		dates.push(date);
		let url = "https://api.brightsky.dev/weather?lat=" + 51.05 + "&lon=" + 13.75 + "&date=" + date;
		
			await $.getJSON(url, function(data) {
				let precipitationSum = 0;
				let temperatureAverage = 0;
				for (var hour, i = 0; hour = data.weather[i++];) {
					precipitationSum = precipitationSum + hour.precipitation;
					temperatureAverage = temperatureAverage + hour.temperature;
				}
				precipitationSums.push(precipitationSum);
				temperatureAverages.push(temperatureAverage/25);
			});
	}
	dates.reverse();
	precipitationSums.reverse();
	temperatureAverages.reverse();

	
	await $('#weather-current-year').remove();
	await $('#weather-current-year-container').append('<canvas id="weather-current-year"><canvas>');
  
	var ctx = document.getElementById('weather-current-year').getContext('2d');

	var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Gesamttagesniederschlag in mm',
            data: precipitationSums,
			backgroundColor: 'rgba(54, 162, 235, 0.8)',
			stack: 'combined',
			type: 'bar'
			},
			{
            label: 'Tagesdurchschnittstemperatur in °C',
            data: temperatureAverages,
			backgroundColor: 'rgba(220, 159, 83, 0.8)',
			stack: 'combined'
			
        }]
    },
    options: {
        scales: {
            y: {
				stacked: true
			  }
        }
    }
	});
}


async function displayFormerYearWeather() {
	let newDate = new Date();
	let today = new Date(newDate);
	today.setFullYear(today.getFullYear()-1);
	var dates = [];
	var precipitationSums = [];
	var temperatureAverages = [];
	document.getElementById('year-before').innerHTML = today.getFullYear();
	
	for (let i = 0; i < 30; i++) {
		today.setDate(today.getDate()-1);
		
		let date = today.toISOString().slice(0, 10);
		dates.push(date);
		let url = "https://api.brightsky.dev/weather?lat=" + 51.05 + "&lon=" + 13.75 + "&date=" + date;
		
			await $.getJSON(url, function(data) {
				let precipitationSum = 0;
				let temperatureAverage = 0;
				for (var hour, i = 0; hour = data.weather[i++];) {
					precipitationSum = precipitationSum + hour.precipitation;
					temperatureAverage = temperatureAverage + hour.temperature;
				}
				precipitationSums.push(precipitationSum);
				temperatureAverages.push(temperatureAverage/25);
			});
	}
	
	dates.reverse();
	precipitationSums.reverse();
	temperatureAverages.reverse();
	
	await $('#weather-year-before').remove();
	await $('#weather-year-before-container').append('<canvas id="weather-year-before"><canvas>');
	
	var ctx = document.getElementById('weather-year-before').getContext('2d');

	var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
            label: 'Gesamttagesniederschlag in mm',
            data: precipitationSums,
			backgroundColor: 'rgba(54, 162, 235, 0.8)',
			stack: 'combined',
			type: 'bar'
			},
			{
            label: 'Tagesdurchschnittstemperatur in °C',
            data: temperatureAverages,
			backgroundColor: 'rgba(220, 159, 83, 0.8)',
			stack: 'combined'
			
        }]
    },
    options: {
        scales: {
            y: {
				stacked: true
			  }
        }
    }
	});
}

function showTreeStatistics() {
  hideAllInfo();
 
  document.getElementById("treeStatistics").classList.remove("hidden");
  document.getElementById("treeStatisticsNav").classList.add("active");
  
  displayTotalTreeCount();
  displaySpeciesCount();
  displayTreesWithSpeciesCount();
  displayMostCommonSpecies();
  displayOldestTree();
  
  displayPieChart();
  displayBarChart();
}

function displayTotalTreeCount() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		document.getElementById("tree-count").innerHTML = data.length;
	});
}


function displaySpeciesCount() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		var lookup = {};
		var result = [];
		for (var tree, i = 0; tree = data[i++];) {
			var species = tree.speciesId;

			if (!(species in lookup)) {
				lookup[species] = 1;
				result.push(species);
			}
		}
		document.getElementById("species-count").innerHTML = result.length-1;
	});  
}


function displayTreesWithSpeciesCount() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		
		var treesWithSpeciesCount = 0;
		for (var tree, i = 0; tree = data[i++];) {
			if (tree.speciesId != 1) {
				treesWithSpeciesCount++;
			}
		}
		document.getElementById("trees-with-species").innerHTML = treesWithSpeciesCount;
	});  
}

function displayMostCommonSpecies() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		var map = new Map();
		for (var tree, i = 0; tree = data[i++];) {
			var species = tree.species;
				if (species && !map.has(species)) {
					map.set(species, 1);
				} else if (species && map.has(species)){
					var count = map.get(species);
					count++;
					map.set(species, count);
				}
		}
		
		var species = "Keine";
		var occurence = 0;
		for (let [key, value] of map) {
		  if (value > occurence) {
			  species = key;
			  occurence = value;
		  }
		}
		document.getElementById("most-common-species").innerHTML = species;
	});  
}

function displayOldestTree() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		var oldestTree = data[0];
		for (var tree, i = 0; tree = data[i++];) {
			if(tree.age > oldestTree.age) {
				oldestTree = tree;
			}
		}
		document.getElementById("oldest-tree").innerHTML = oldestTree.species + ", " + oldestTree.age + " Jahre";
	});  
}

async function displayPieChart() {

	var withSpecies = 0;
	var withoutSpecies = 0;
	
	await $.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		for (var tree, i = 0; tree = data[i++];) {
			if(tree.speciesId == 1) {
				withoutSpecies++;
			} else {
				withSpecies++;
			}
		}
	});  
	
	await $('#piechart').remove();
	await $('#piechart-container').append('<canvas id="piechart"><canvas>');
	
	var ctx = document.getElementById('piechart').getContext('2d');
	
	var chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ["Art bekannt", "Art unbekannt"],
        datasets: [{
            label: 'Bekanntheit der Art',
            data: [withSpecies, withoutSpecies],
			backgroundColor: ['rgba(96, 174, 76, 0.8)',
							 'rgba(220, 159, 83, 0.8)']
        }]
    },
    options: {
        plugins: {
            legend: {
                position: "right"
            }
        }
    }
	});
}

async function displayBarChart() {
	var speciesArray = [];
	var occurences = [];
	
	await $.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
		var map = new Map();
		for (var tree, i = 0; tree = data[i++];) {
			var species = tree.species;
				if (species && !map.has(species)) {
					map.set(species, 1);
				} else if (species && map.has(species)){
					var count = map.get(species);
					count++;
					map.set(species, count);
				}
		}
		var sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
		arrayTmp = Array.from(sortedMap).slice(0, 10),
		slicedMap = new Map(arrayTmp);
		for (let [key, value] of slicedMap) {
			speciesArray.push(key);
			occurences.push(value);
		}
	});
	
	await $('#specieschart').remove();
	await $('#specieschart-container').append('<canvas id="specieschart"><canvas>');
	
	var ctx = document.getElementById('specieschart').getContext('2d');

	var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: speciesArray,
        datasets: [{
            label: 'Anzahl Bäume je Art',
            data: occurences,
			backgroundColor: 'rgba(96, 174, 76, 0.8)'
        }]
    },
    options: {
		indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true
            }
        }
    }
	});
}

function showWeatherStatistics() {
  hideAllInfo();
  
  displayCurrentYearWeather();
  displayFormerYearWeather();
  document.getElementById("weatherStatistics").classList.remove("hidden");
  document.getElementById("weatherStatisticsNav").classList.add("active");
}

function showHowToWater() {
  hideAllInfo();
  
  document.getElementById("howToWater").classList.remove("hidden");
  document.getElementById("howToWaterNav").classList.add("active");
}

function showLegal() {
  hideAllInfo();
  
  document.getElementById("legal").classList.remove("hidden");
  document.getElementById("legalNav").classList.add("active");
}