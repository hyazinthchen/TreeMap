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
        species = feature.properties.circumference;
    }
	document.getElementById("circumference").innerHTML = circumference;
	
	var age = "unbekannt";
    if (feature.properties.age != 0) {
        species = feature.properties.age;
    }
	document.getElementById("age").innerHTML = age;
	
	//TODO: Wasserbedarf
	
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

function get30DayPrecipitation(latitude, longitude) {
	let newDate = new Date();
	let today = new Date(newDate);
	
	
	var dates = [];
	var precipitationSums = [];
	
	for (let i = 0; i < 30; i++) {
		today.setDate(today.getDate()-1);
		
		let date = today.toISOString().slice(0, 10);
		dates.push(date);
		let url = "https://api.brightsky.dev/weather?lat=" + latitude + "&lon=" + longitude + "&date=" + date;
		
		$.getJSON(url, function(data) {
			let precipitationSum = 0;
			for (var hour, i = 0; hour = data.weather[i++];) {
				precipitationSum = precipitationSum + hour.precipitation;
			}
			precipitationSums.push(precipitationSum);
		});
	}
}

function getForecast(latitude, longitude) {
	let today = new Date();
	let tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate()+1);
	let date = tomorrow.toISOString().slice(0, 10);
	let url = "https://api.brightsky.dev/weather?lat=" + latitude + "&lon=" + longitude + "&date=" + date;

	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };	
	document.getElementById("forecast-date").innerHTML = "für morgen, " + tomorrow.toLocaleDateString('de-DE', options);
		
	$.getJSON(url, function(data) {
		document.getElementById("weather-icon-1").innerHTML = mapWeatherIcons(data.weather[4].icon);
		document.getElementById("precipitation-1").innerHTML = data.weather[4].precipitation + " mm/h";
		document.getElementById("weather-icon-2").innerHTML = mapWeatherIcons(data.weather[8].icon);
		document.getElementById("precipitation-2").innerHTML = data.weather[8].precipitation + " mm/h";
		document.getElementById("weather-icon-3").innerHTML = mapWeatherIcons(data.weather[12].icon);
		document.getElementById("precipitation-3").innerHTML = data.weather[12].precipitation + " mm/h";
		document.getElementById("weather-icon-4").innerHTML = mapWeatherIcons(data.weather[16].icon);
		document.getElementById("precipitation-4").innerHTML = data.weather[16].precipitation + " mm/h";
		document.getElementById("weather-icon-5").innerHTML = mapWeatherIcons(data.weather[20].icon);
		document.getElementById("precipitation-5").innerHTML = data.weather[20].precipitation + " mm/h";
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

function count() {
	$.getJSON("https://trees.hyazinthchen.com/data/trees.json", function(data) {
	var withoutSpecies = 0;
	var withSpecies = 0;
		for (var tree, i = 0; tree = data[i++];) {
			if(tree.speciesId == 1) {
				withoutSpecies++;
			} else {
				withSpecies++;
			}
		}
	return [withoutSpecies, withSpecies];
	});  
}

function displayPieChart() {
	  var data = [{
		  values: count(),
		  labels: ['Art unbekannt', 'Art bekannt'],
		  textinfo: "label+percent",
		  textposition: "outside",
		  type: 'pie',
			marker: {
			  colors: ['rgb(220, 159, 83)', 'rgb(96, 174, 76)'],
			}
	  }];

	  var layout = {
		title: 'Angabe über die Baumart',
		showlegend: false,
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		width: '100%'
	  };

	var config = {responsive: true};
	
	piechartDiv = document.getElementById('piechart');
	Plotly.newPlot( piechartDiv, data, layout, config );
}


function getTreesBySpecies() {
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
		var species = [];
		for (let [key, value] of map) {
			species.push(key);
		}
		return species;
	});  
}

function countTreesBySpecies() {
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
		var occurences = [];
		for (let [key, value] of map) {
			occurences.push(value);
		}
		return occurences;
	});  
}


function displayBarChart() {
	var data = [{
		y: getTreesBySpecies(),
		x: countTreesBySpecies(),
		type: 'bar',
		orientation: 'h',
		marker: {
			color: 'rgb(96, 174, 76)'
		}
    }];
 
	var layout = {
		title: 'Anzahl Bäume je Art',
		bargap: 0.25,
		yaxis: {
			automargin: true
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)',
		width: '100%'
	};
  
	var config = {responsive: true};
	
	barchartDiv = document.getElementById('barchart');
	Plotly.newPlot( barchartDiv, data, layout, config );
}

function showWeatherStatistics() {
  hideAllInfo();
  
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