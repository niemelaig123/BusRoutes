// IIFE
(() => {

    //create map in leaflet and tie it to the div called 'theMap'
    let map = L.map('theMap').setView([44.650627, -63.597140], 14);

    let busIcon = L.icon({
            iconUrl: "bus.png",
            iconSize: [45, 45]
    })


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        
    // L.marker([44.650690, -63.596537], { icon: busIcon}).addTo(map)
    //     .bindPopup('This is a sample popup. You can put any html structure in this including extra bus data. You can also swap this icon out for a custom icon. A png file has been provided for you to use if you wish.')
    //     .openPopup();

    // declare layer group
    const markers = L.layerGroup().addTo(map);
    // Get bus route data from API
    const routes = () => fetch("https://hrmbusapi.herokuapp.com/")
    .then(response => response.json())
    .then(data => {
        return data.entity.filter(entity => entity.vehicle.trip.routeId < 11);      
    })
    .then(data => routeData(data))
    .then(data => {
        // Erase previous markers
        clearMarkers(markers);
        // make new markers
        markRoutes(data, markers); 
    });
    

    // Convert the API data to geoJSON
    const routeData = (json) => {
        let geo = {"type": "featureCollection", "features": []}
        json.map(entity => {
            let bearing = entity.vehicle.position.bearing;
            let coords = [entity.vehicle.position.latitude, entity.vehicle.position.longitude];
            let feature = {"type": "Feature", "geometry": {
                "bearing": bearing,
                "coordinates": coords
            }}
            geo.features.push(feature);
        })
        return geo;
    };

    // Use geoJSON to plot map markers
    const markRoutes = (json, markers) => {
        
        json.features.map(entity => {
            let bearing = entity.geometry.bearing;
            let lat = entity.geometry.coordinates[0];
            let long = entity.geometry.coordinates[1];
    
            let bus = L.marker([lat, long], { icon: busIcon, rotationAngle: bearing }).addTo(map)
                .bindPopup(`Bearing: ${bearing} \nLatitude: ${lat} \nLongitude: ${long}`).addTo(markers);
                console.log(bus);
            
        })
    }

    // Helper function to clear the map
    const clearMarkers = (markers) => {
        markers.clearLayers();
    }

    // setinterval or something similar to re-fetch every few minutes
    setInterval(routes, 5000);

})()