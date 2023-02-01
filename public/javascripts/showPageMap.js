mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL (streets-v11)
    center: place.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {

map.addControl(new mapboxgl.NavigationControl());

map.setFog({}); // Set the default atmosphere style
});

new mapboxgl.Marker()
    .setLngLat(place.geometry.coordinates)
    .addTo(map)