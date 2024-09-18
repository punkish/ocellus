import { drawControlLayer } from "./controls.js";
import { drawH3 } from "./h3.js";
import { drawTreatments } from "./treatments.js";
//import { addLayer, removeLayer } from "./utils.js";

function initializeMap() {
    const initialMapCenter = [0, 0];
    const initialZoom = 2;
    const maxZoom = 10;
    const map = L.map('mapSearch').setView(initialMapCenter, initialZoom);

    // turn off the Ukrainian flag emoji
    map.attributionControl.setPrefix('');

    // set map source
    let baseLayer = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    baseLayer = 'http://localhost:3000/countries-coastline-1m/{z}/{x}/{y}';
    
    const baseLayerOpts = {
        maxZoom,
        vectorTileLayerStyles: {
            
            // A plain set of L.Path options.
            geojsonLayer: {
                weight: 1,
                color: '#000',
                fillColor: '#f5f5f5',
                fillOpacity: 1,
                fill: true
            }
        }
    };

    const mapLayers = {
        //baselayer: L.tileLayer(mapSource, baseLayerOpts).addTo(map),
        baselayer: L.vectorGrid.protobuf(baseLayer, baseLayerOpts).addTo(map)
        // drawControls: null,
        // h3: null,
        // treatments: null
    }

    drawControlLayer(map, mapLayers);
    switchTreatments2H3(map, mapLayers);

    map.on('moveend', function(e) {
        //switchTreatments2H3(map, mapLayers);
        drawH3(map, mapLayers);
    });

    // map.on('locationfound', onLocationFound);
    // map.on('locationerror', (e) => { alert(e.message) });
}

function switchTreatments2H3(map, mapLayers) {
    const zoom = map.getZoom();
    
    if (zoom <= 5) {
        drawH3(map, mapLayers);
    }
    else {
        drawTreatments(map, mapLayers);
    }
}

// function onLocationFound(e) {
//     const radius = e.accuracy;
//     const url = `${globals.server}/treatments?cols=latitude&cols=longitude&size=1000`;
//     getTreatments(url);

//     L.marker(e.latlng).addTo(map)
//         .bindPopup(`You are within${radius}meters from this point`)
//         .openPopup();

//     L.circle(e.latlng, radius).addTo(map);
// }

export { initializeMap }