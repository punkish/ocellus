import { $, $$ } from './base.js';
// import { globals } from './globals.js';
// import { toggleDateSelector } from './listeners.js';

function geoSearchWidget(event) {

    // initialize map with drawControl
    const map = L.map('mapSearch').setView([0, 0], 1);

    // turn off the flag emoji
    map.attributionControl.setPrefix('');

    // set map source
    const mapSource = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    L.tileLayer(mapSource, {
        maxZoom: 19,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // redraw the map if the browser window is resized
    //map.invalidateSize(true);

    // the featureGroup stores the user-drawn features
    const editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);
    
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
            featureGroup: editableLayers, 
            //remove: false
        }
    };
    
    const drawControl = new L.Control.Draw(drawControlOptions);
    map.addControl(drawControl);
    
    map.on(L.Draw.Event.CREATED, function (e) {
        const type = e.layerType;
        const layer = e.layer;
    
        // if (type === 'marker') {
        //     layer.bindPopup('A popup!');
        // }

        const coordsContainer = $('#coords');
        const asGeolocation = $('input[name=as-geolocation');
        
        if (type === 'rectangle') {

            // Coordinates of Leaflet.Draw rectangle
            // https://stackoverflow.com/a/25082132
            const coords = layer.toGeoJSON().geometry.coordinates;
            const [ll, ul, ur, lr, or] = coords[0];

            const min_lat = ll[1].toFixed(2);
            const min_lng = ll[0].toFixed(2);
            const max_lat = ur[1].toFixed(2);
            const max_lng = ur[0].toFixed(2);

            // write the coords to a div for display
            coordsContainer.innerHTML = `lower left: lat ${min_lat}, lng ${min_lng}, upper right: lat ${max_lat}, lng ${max_lng}`;

            // save the coords to hidden input fields for query
            asGeolocation.value = `within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})`;
            
        }
        else if (type === 'circle') {

            // Coords of Leaflet.Draw circle
            // https://stackoverflow.com/a/61910387
            const center = e.layer.getLatLng();
            const lng = (center.lng).toFixed(2);
            const lat = (center.lat).toFixed(2);

            // convert radius to kms and round to two decimal places
            const radius = (e.layer.getRadius() / 1000).toFixed(2);

            coordsContainer.innerHTML = `within ${radius} kms of ${lng}, ${lat}`;
            
            asGeolocation.value = `within(radius:${radius},units:'kilometers',lat:${lat},lng:${lng})`;
        }
    
        editableLayers.addLayer(layer);
    });

    map.on(L.Draw.Event.DELETED, function (e) {
        // remove coords from display and form
        const asGeolocation = $('input[name=as-geolocation');
        asGeolocation.value = '';

        const coordsContainer = $('#coords');
        coordsContainer.innerHTML = '';
    });
}

const init = () => {

    // const biomeAc = new autoComplete({
    //     selector: $('input[name="as-biome"]'),
    
    //     //
    //     // 
    //     // 'term' refers to the value currently in the text input.
    //     // 'response' callback, which expects a single argument: the data 
    //     //      to suggest to the user. This data must be an array of 
    //     //      filtered suggestions based on the provided term:
    //     //      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
    //     // 
    //     //
    //     source: async function(term, suggest) {
    //         const response = await fetch(`${globals.server}/biomes?biome=${term}*`);
    
    //         if (!response.ok) {
    //             throw Error("HTTP-Error: " + response.status)
    //         }
    
    //         const json = await response.json();
    //         const matches = [];
    
    //         if (json.item.result.records) {
    //             json.item.result.records.forEach(r => matches.push(r.biome_synonym));
    //         }
    //         else {
    //             matches.push('nothing found… please try again');
    //         }
    
    //         //
    //         // We narrow the matches array as the user types in the input 
    //         // field. This makes the dropdown box focus on only the 
    //         // matching terms
    //         //
    //         if (matches.length) {
    //             const suggestions = [];
    
    //             for (let i=0; i<matches.length; i++) {
    //                 if (~matches[i].toLowerCase().indexOf(term)) {
    //                     suggestions.push(matches[i]);
    //                 }
    //             }
    
    //             suggest(suggestions);
    //         }
    //     },
    
    //     minChars: 3,
    //     delay: 150
    // });
    
}

// const authorityAc = new autoComplete({
//     selector: document.querySelector('input[name=authorityName]'),

//     //
//     // 
//     // 'term' refers to the value currently in the text input.
//     // 'response' callback, which expects a single argument: the data 
//     //      to suggest to the user. This data must be an array of 
//     //      filtered suggestions based on the provided term:
//     //      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
//     // 
//     //
//     source: async function(term, suggest) {
        

//         const response = await fetch(`http://localhost:3010/v3/treatmentauthors?treatmentAuthor=${term}*`);

//         if (!response.ok) {
//             throw Error("HTTP-Error: " + response.status)
//         }

       
//         const json = await response.json();
//         const matches = [];

//         if (json.item.result.records) {
//             json.item.result.records.forEach(r => matches.push(r.treatmentAuthor));
//         }
//         else {
//             matches.push('nothing found… please try again');
//         }

//         //
//         // We narrow the matches array as the user types in the input 
//         // field. This makes the dropdown box focus on only the 
//         // matching terms
//         //
//         if (matches.length) {
//             const suggestions = [];

//             for (let i=0; i<matches.length; i++) {
//                 if (~matches[i].toLowerCase().indexOf(term)) {
//                     suggestions.push(matches[i]);
//                 }
//             }

//             suggest(suggestions);
//         }
//     },

//     minChars: 3,
//     delay: 150
// });

export { init, geoSearchWidget }