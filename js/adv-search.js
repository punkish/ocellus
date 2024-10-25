import { $, $$ } from './base.js';
import { globals } from './globals.js';
// import { toggleDateSelector } from './listeners.js';

// function geoSearchWidget(event) {

//     // initialize map with drawControl
//     const initialMapCenter = [0, 0];
//     const initialZoom = 2;
//     const map = L.map('mapSearch').setView(initialMapCenter, initialZoom);

//     // turn off the Ukrainian flag emoji
//     map.attributionControl.setPrefix('');

//     // set map source
//     let mapSource = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
//     //mapSource = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

//     L.tileLayer(mapSource, {
//         maxZoom: 19,
//         //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map);

//     // redraw the map if the browser window is resized
//     //map.invalidateSize(true);
//     //drawHeatMap(map);
//     //drawBinsGeoJson(map);
    
//     drawControlLayer(map);
// }

// lower left: lat -76.41, lng: -165.94; upper right: lat 72.32, lng 165.23

async function drawHeatMap(map) {
    const points = await getMaterialCitations();
    const heatOptions = {
        gradient: {
            0.4: 'blue',
            0.6: 'cyan',
            0.7: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        },
        radius: 15
    }

    const heatMap = L.heatLayer(points, heatOptions).addTo(map);
}

function drawControlLayer(map, layers) {

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

            // write the coords to a div for display
            const min_lat = ll[1].toFixed(2);
            const min_lng = ll[0].toFixed(2);
            const max_lat = ur[1].toFixed(2);
            const max_lng = ur[0].toFixed(2);
            
            coordsContainer.innerHTML = `lower left: lat ${min_lat}, lng: ${min_lng}; upper right: lat ${max_lat}, lng ${max_lng}`;

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

async function getCollectionCodes() {
    if (globals.cache.collectionCodes) {
        return globals.cache.collectionCodes;
    }
    else {
        const url = `${globals.uri.zenodeo}/collectioncodes?cols=collectionCode&cols=name&size=4300`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const records = json.item.result.records;
    
            if (records) {
                globals.cache.collectionCodes = records.map(r => {
                    return {
                        collectionCode: r.collectionCode,
                        name: r.name
                    }
                });

                return globals.cache.collectionCodes;
            }
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }
    
}

async function getJournalTitles() {
    if (globals.cache.journals) {
        return globals.cache.journals;
    }
    else {
        const url = `${globals.uri.zenodeo}/journals?size=1100&sortby=journalTitle:asc`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const records = json.item.result.records;
    
            if (records) {
                globals.cache.journals = records.map(r => {
                    return {
                        journals_id: r.journals_id,
                        journalTitle: r.journalTitle
                    }
                });

                return globals.cache.journals;
            }
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }
    
}

async function getMaterialCitations() {
    
        const url = `${globals.uri.zenodeo}/materialcitations?validGeo=true&cols=latitude&cols=longitude&size=520000`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            const res = await response.json();
            return res.item
                .result
                .records.map(m => [ m.latitude, m.longitude ]);
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    
}

async function getBins(binLevel) {
    if (globals.cache.bins[binLevel]) {
        return globals.cache.bins[binLevel];
    }
    else {
        const url = `${globals.uri.zenodeo}/bins/${binLevel}`;
        const response = await fetch(url);
    
        // if HTTP-status is 200-299
        if (response.ok) {
            globals.cache.bins[binLevel] = await response.json();
            return globals.cache.bins[binLevel];
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status);
        }
    }
}

function getInterval(val, interval, min) {

}

function equalFrequencyBins(arr, m) {
    const a = arr.length; 
    const n = Math.floor(a / m);

    for (let i = 0; i < m; i++) {
        const arr1 = [];

        for (let j = i * n, k = (i + 1) * n; j < k; j++) {
            if (j >= a) {
                break;
            }

            arr1.push([arr[j]]);
        } 
            
        print(arr1);
    }
}

const h3BoundsToPolygon = (lngLatH3Bounds) => {
    lngLatH3Bounds.push(lngLatH3Bounds[0]); // "close" the polygon
    return lngLatH3Bounds;
};

async function drawBins(map) {
    // if (hexLayer) {
    //     hexLayer.remove();
    // }

    const hexLayer = L.layerGroup().addTo(map);

    // const zoom = map.getZoom();
    // this.currentH3Res = getH3ResForMapZoom(zoom);
    // const { _southWest: sw, _northEast: ne} = map.getBounds();

    // const boundsPolygon =[
    //     [ sw.lat, sw.lng ],
    //     [ ne.lat, sw.lng ],
    //     [ ne.lat, ne.lng ],
    //     [ sw.lat, ne.lng ],
    //     [ sw.lat, sw.lng ],
    // ];

    // const h3s = h3.polygonToCells(boundsPolygon, this.currentH3Res);

    const bins = await getBins(2);

    for (const [ h3id, numOfTreatments ] of Object.entries(bins)) {

        const polygonLayer = L.layerGroup()
            .addTo(hexLayer);

        //const isSelected = h3id === this.searchH3Id;

        //const style = isSelected ? { fillColor: "orange" } : {};

        const h3Bounds = h3.cellToBoundary(h3id);
        //const averageEdgeLength = this.computeAverageEdgeLengthInMeters(h3Bounds);
        const cellArea = h3.cellArea(h3id, "m2");

        const tooltipText = `
        Cell ID: <b>${ h3id }</b>
        <br />
        Num of Treatments: <b>${ numOfTreatments }</b>
        <br />
        Cell area (m^2): <b>${ cellArea.toLocaleString() }</b>
        `;

        const style = {
            "color": "#444",
            "weight": 0,
            "opacity": 1
        }

        const h3Polygon = L.polygon(h3BoundsToPolygon(h3Bounds), style)
            //.on('click', () => copyToClipboard(h3id))
            .bindTooltip(tooltipText)
            .addTo(polygonLayer);

        // less SVG, otherwise perf is bad
        if (
            Math.random() > 0.8 
            //|| isSelected
        ) {
            var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            svgElement.setAttribute('viewBox', "0 0 200 200");
            svgElement.innerHTML = `<text x="20" y="70" class="h3Text">${h3id}</text>`;
            var svgElementBounds = h3Polygon.getBounds();
            L.svgOverlay(svgElement, svgElementBounds).addTo(polygonLayer);
        }
    }
}

async function drawBinsGeoJson(map) {
    const bins = await getBins(2);
    const counts = Object.values(bins);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const range = max - min;
    const numOfIntervals = 8;
    const interval = Math.round(range / numOfIntervals); 

    const grid = [];

    for (const [ cellId, numOfTreatments ] of Object.entries(bins)) {
        grid.push({
            "type": "Feature",
            "properties": {
                cellId,
                numOfTreatments,
                "interval": Math.floor(numOfTreatments / interval)
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [h3.cellToBoundary(cellId, true)]
            }
        })
    }

    L.geoJSON(grid, {
        style: function(feature) {
            const style = {
                "color": "#444",
                "weight": 1,
                "opacity": 1
            }

            if (feature.properties.interval === 7) {
                style.fillColor = "#b10026";
            }
            else if (feature.properties.interval === 6) {
                style.fillColor = "#e31a1c";
            }
            else if (feature.properties.interval === 5) {
                style.fillColor = "#fc4e2a";
            }
            else if (feature.properties.interval === 4) {
                style.fillColor = "#fd8d3c";
            }
            else if (feature.properties.interval === 3) {
                style.fillColor = "#feb24c";
            }
            else if (feature.properties.interval === 2) {
                style.fillColor = "#fed976";
            }
            else if (feature.properties.interval === 1) {
                style.fillColor = "#ffeda0";
            }
            else {
                style.fillColor = "#ffffcc";
            }

            return style;
        },
        onEachFeature: function(feature, layer) {
            const cellId = feature.properties.cellId;
            const numOfTreatments = feature.properties.numOfTreatments;
            const cellArea = h3.cellArea(cellId, "m2");
            const tooltipText = `Cell ID: <b>${ cellId }</b>
            <br />
            Num of Treatments: <b>${ numOfTreatments }</b>
            <br />
            Cell area (m^2): <b>${ cellArea.toLocaleString() }</b>`;
            layer.setTooltipContent(tooltipText);

            layer.on('mouseover', function(e) {
              layer.setStyle({
                weight: 4,
                color: 'yellow'
              });
            });

            layer.on('mouseout', function(e) {
              layer.setStyle({
                weight: 1,
                color: '#444'
              });
            });

          }
        }).addTo(map);
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

function journalTitleAc() {
    const ac = new autoComplete({
        selector: 'input[name="as-journalTitle"]',
        minChars: 2,
        source: async function(term, suggest) {
            term = term.toLowerCase();
            const choices = await getJournalTitles();
            const matches = [];

            for (let i=0; i < choices.length; i++) {

                if (~choices[i].journalTitle.toLowerCase().indexOf(term)) {
                    matches.push({
                        journals_id: choices[i].journals_id,
                        journalTitle: choices[i].journalTitle
                    });
                }

                // if (~choices[i][val].toLowerCase().indexOf(term)) {
                //     matches.push({
                //         key: choices[i][key],
                //         val: choices[i][val]
                //     });
                // }
            }
            
            suggest(matches);
        },
        renderItem: function (item, search){
            
            // escape special characters
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            const disp = item.journalTitle.replace(re, "<b>$1</b>");
            return `<div class="autocomplete-suggestion" data-id="${item.journalTitle}" data-val="${item.journalTitle}">${disp}</div>`;
        },
        onSelect: function(e, term, item){
            document.querySelector('input[name="as-journalTitle"]').value = item.getAttribute('data-id');
        }
    });
}

function collectionCodeAc() {
    const ac = new autoComplete({
        selector: 'input[name="as-collectionCode"]',
        minChars: 2,
        source: async function(term, suggest) {
            term = term.toLowerCase();
            const choices = await getCollectionCodes();
            const matches = [];

            for (let i=0; i < choices.length; i++) {
                
                if (~choices[i].collectionCode.toLowerCase().indexOf(term)) {
                    matches.push({
                        collectionCode: choices[i].collectionCode,
                        name: choices[i].name
                    });
                }

            }
            
            suggest(matches);
        },
        renderItem: function (item, search){
            
            // escape special characters
            search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            let disp = item.collectionCode.replace(re, "<b>$1</b>");

            if (item.name) {
                disp += ` (${item.name})`;
            }

            return `<div class="autocomplete-suggestion" data-id="${item.collectionCode}">${disp}</div>`;
        },
        onSelect: function(e, term, item){
            document.querySelector('input[name="as-collectionCode"]').value = item.getAttribute('data-id');
        }
        
    });
}

export { 
    init, 
    //geoSearchWidget, 
    getJournalTitles, 
    getCollectionCodes, 
    journalTitleAc,
    collectionCodeAc
    //getBins 
}