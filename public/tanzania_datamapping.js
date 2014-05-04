		$.getJSON('/allfilter', function(temp_data) {

			var data = temp_data.filter;
			var markers = L.markerClusterGroup();

			function onEachFeature(feature, layer) {

				var blue;
				if(feature.properties.petrifilm_blue == -1) {
					blue = '-';
				} else {
					blue = feature.properties.petrifilm_blue;
				}

				var red;
				if(feature.properties.petrifilm_red == -1) {
					red = '-';
				} else {
					red = feature.properties.petrifilm_red;
				}

				var col;
				if(feature.properties.colilert == 'none') {
					col = '-';
				} else {
					col = feature.properties.colilert;
				}
 

				var popupContent = 
						"<h2>"+feature.properties.reference +"</h2>"
						+ "<p>"+feature.properties.sourcetype+"</p>"
						// + "<p>petrifilm (blue): "+feature.properties.petrifilm_blue+"</p>"
						// + "<p>petrifilm (red):  "+feature.properties.petrifilm_red+"</p>"
						// + "<p>colilert (color): "+feature.properties.colilert+"</p>";
						+ "<p>petrifilm (blue): "+blue+"</p>"
						+ "<p>petrifilm (red):  "+red+"</p>"
						+ "<p>colilert (color): "+col+"</p>";
				layer.bindPopup(popupContent);
			}

			var geoJsonLayer = L.geoJson(data, {
				onEachFeature: onEachFeature,

				pointToLayer: function (feature, latlng) {
					var pet_b = feature.properties["petrifilm_blue"];
					var pet_r = feature.properties["petrifilm_red"];
					var col = feature.properties["colilert"];
					var color;

					if (pet_b > 0 || col == "fluorescence") {
						color = "#ff7800";
					} else if (pet_r > 0 || col == "yellow") {
						color = "#ffff33";
					} else {
						color = "#3399ff";
					}

					return L.marker(latlng, {
						icon: L.mapbox.marker.icon({
					        'marker-color': color,
					    })

					});
				},
			});
			// .addTo(map);

			markers.addLayer(geoJsonLayer);
			map.addLayer(markers);
			// map.fitBounds(markers.getBounds());
		});
	// }

	var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-zr0njcqy/{z}/{x}/{y}.png', {
	    attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
	});
	var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // basic open street map


	// var osmUrl='http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/22677/256/{z}/{x}/{y}.png'; // black & white
	// var osmUrl='http://a.tiles.mapbox.com/v3/brianhouse.map-oxn5wd2a/{z}/{x}/{y}.png'; // satellite (not for zoom in 19)
	var osmAttrib='Map data OpenStreetMap contributors';
	var osm = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 20, attribution: osmAttrib});

	var map = L.map('map', {
		center: [-6.8557, 39.237], // lat, lon
		zoom: 17,
		zoomControl: false
	});
	// map.addLayer(osm);
	map.addLayer(L.mapbox.tileLayer('examples.map-20v6611k'), 'Base Map', 1);

	new L.Control.Zoom({ position : 'topright'}).addTo(map); 
