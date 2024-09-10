import { addLayer } from "./utils.js";
import { $, $$ } from "../base.js";

function drawControlLayer(map, mapLayers) {

    // the featureGroup stores the user-drawn features
    mapLayers.drawControls = new L.FeatureGroup();
    addLayer(map, mapLayers.drawControls);

    // const MyCustomMarker = L.Icon.extend({
    //     options: {
    //         shadowUrl: null,
    //         iconAnchor: new L.Point(12, 12),
    //         iconSize: new L.Point(24, 24),
    //         iconUrl: 'link/to/image.png'
    //     }
    // });

    const drawControlOptions = {
        position: 'topleft',
        draw: {

            // Turns off this drawing tool
            polyline: false,
            // polyline: {
            //     shapeOptions: {
            //         color: '#f357a1',
            //         weight: 10
            //     }
            // },

            // Turns off this drawing tool
            polygon: false,
            // polygon: {

            //     // Restricts shapes to simple polygons
            //     allowIntersection: false,
            //     drawError: {

            //         // Color the shape will turn when intersects
            //         color: '#e1e100',

            //         // Message that will show when intersect
            //         message: '<strong>Oh snap!<strong> you can\'t draw that!'
            //     },
            //     shapeOptions: {
            //         color: '#bada55'
            //     }
            // },

            circle: {
                shapeOptions: {
                    weight: 1
                }
            }, 
            rectangle: {
                shapeOptions: {
                    clickable: false,
                    weight: 1
                }
            },

            // Turns off these drawing tool
            circlemarker: false,
            marker: false
            // marker: {
            //     icon: new MyCustomMarker()
            // }
        },
        edit: {

            //REQUIRED!!
            featureGroup: mapLayers.drawControls, 
            //remove: false
        }
    };

    const drawControl = new L.Control.Draw(drawControlOptions);
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        const drawnFeatureType = e.layerType;
        const drawnFeature = e.layer;

        // if (type === 'marker') {
        //     layer.bindPopup('A popup!');
        // }

        const coordsDiv = $('#coords');
        const asGeolocation = $('input[name=as-geolocation');
        
        if (drawnFeatureType === 'rectangle') {

            // Coordinates of Leaflet.Draw rectangle
            // https://stackoverflow.com/a/25082132
            const coords = drawnFeature.toGeoJSON().geometry.coordinates;
            const [ll, ul, ur, lr, or] = coords[0];

            // write the coords to a div for display
            const min_lat = ll[1].toFixed(2);
            const min_lng = ll[0].toFixed(2);
            const max_lat = ur[1].toFixed(2);
            const max_lng = ur[0].toFixed(2);
            
            coordsDiv.innerHTML = `lower left: lat ${min_lat}, lng: ${min_lng}; upper right: lat ${max_lat}, lng ${max_lng}`;

            // save the coords to hidden input fields for query
            asGeolocation.value = `within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})`;
            
        }
        else if (drawnFeatureType === 'circle') {

            // Coords of Leaflet.Draw circle
            // https://stackoverflow.com/a/61910387
            const center = e.layer.getLatLng();
            const lng = (center.lng).toFixed(2);
            const lat = (center.lat).toFixed(2);

            // convert radius to kms and round to two decimal places
            const radius = (e.layer.getRadius() / 1000).toFixed(2);

            coordsDiv.innerHTML = `within ${radius} kms of ${lng}, ${lat}`;
            asGeolocation.value = `within(radius:${radius},units:'kilometers',lat:${lat},lng:${lng})`;
        }

        mapLayers.drawControls.addLayer(drawnFeature);
    });

    // remove coords from display and form
    map.on(L.Draw.Event.DELETED, function (e) {
        $('input[name=as-geolocation').value = '';
        $('#coords').innerHTML = '';
    });
}

export { drawControlLayer }