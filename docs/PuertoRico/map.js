
      mapboxgl.accessToken = 'pk.eyJ1Ijoia2FybWFuLWxpbmUiLCJhIjoiY2tpZ2tycTdkMDgxbDJxczhpM3J6Yjd5cSJ9.j-A7KLmgzJ4ghuLEOI5JrA';
      var map = new mapboxgl.Map({
        container: 'map', // Specify the container ID
        style: 'mapbox://styles/mapbox/dark-v10', // Specify which map style to use
        center: [-66.61406, 18.01108], // Specify the starting position [lng, lat]
        zoom: 9.5 // Specify the starting zoom
      });

    //   18.01108 -66.61406

      // We only want to return earthquakes that happened in the last week
      // Use JavaScript to get today's date
      var today = new Date();
      // Use JavaScript to get the date a week ago
      var priorDate = new Date().setDate(today.getDate() - 7);
      // Set that to an ISO8601 timestamp as required by the USGS earthquake API
      var priorDateTs = new Date(priorDate);
      var sevenDaysAgo = priorDateTs.toISOString();

      // Target the span elements used in the sidebar
      var magDisplay = document.getElementById('mag');
      var locDisplay = document.getElementById('loc');
      var dateDisplay = document.getElementById('date');

      map.on('load', function () {
        // When the map loads, add the data from the USGS earthquake API as a source
        map.addSource('earthquakes', {
          'type': 'geojson',
          'data':
            'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&minmagnitude=1&starttime=' +
            sevenDaysAgo, // Use the sevenDaysAgo variable to only retrieve quakes from the past week
          'generateId': true // This ensures that all features have unique IDs
        });

        // Add earthquakes as a layer and style it
        map.addLayer({
          'id': 'earthquakes-viz',
          'type': 'circle',
          'source': 'earthquakes',
          'paint': {
            // The feature-state dependent circle-radius expression will render
            // the radius size according to its magnitude when
            // a feature's hover state is set to true
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                1,
                8,
                1.5,
                10,
                2,
                12,
                2.5,
                14,
                3,
                16,
                3.5,
                18,
                4.5,
                20,
                6.5,
                22,
                8.5,
                24,
                10.5,
                26
              ],
              7
            ],
            'circle-stroke-color': '#000',
            'circle-opacity': 0.4,
            'circle-stroke-width': 1,
            // The feature-state dependent circle-color expression will render
            // the color according to its magnitude when
            // a feature's hover state is set to true
            'circle-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              [
                'interpolate',
                ['linear'],
                ['get', 'mag'],
                1,
                '#fff7ec',
                1.5,
                '#fee8c8',
                2,
                '#fdd49e',
                2.5,
                '#fdbb84',
                3,
                '#fc8d59',
                3.5,
                '#ef6548',
                4.5,
                '#d7301f',
                6.5,
                '#b30000',
                8.5,
                '#7f0000',
                10.5,
                '#000'
              ],
              '#3EB595'
            ]
          }
        });

        var quakeID = null;

        map.on('mousemove', 'earthquakes-viz', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          // Set variables equal to the current feature's magnitude, location, and time
          var quakeMagnitude = e.features[0].properties.mag;
          var quakeLocation = e.features[0].properties.place;
          var quakeDate = new Date(e.features[0].properties.time);

          if (e.features.length > 0) {
            // Display the magnitude, location, and time in the sidebar
            magDisplay.textContent = quakeMagnitude;
            locDisplay.textContent = quakeLocation;
            dateDisplay.textContent = quakeDate;

            // When the mouse moves over the earthquakes-viz layer, update the
            // feature state for the feature under the mouse
            if (quakeID) {
              map.removeFeatureState({
                source: 'earthquakes',
                id: quakeID
              });
            }

            quakeID = e.features[0].id;

            map.setFeatureState(
              {
                source: 'earthquakes',
                id: quakeID
              },
              {
                hover: true
              }
            );
          }
        });

        // When the mouse leaves the earthquakes-viz layer, update the
        // feature state of the previously hovered feature
        map.on('mouseleave', 'earthquakes-viz', function () {
          if (quakeID) {
            map.setFeatureState(
              {
                source: 'earthquakes',
                id: quakeID
              },
              {
                hover: false
              }
            );
          }
          quakeID = null;
          // Remove the information from the previously hovered feature from the sidebar
          magDisplay.textContent = '';
          locDisplay.textContent = '';
          dateDisplay.textContent = '';
          // Reset the cursor style
          map.getCanvas().style.cursor = '';
        });
      });
    