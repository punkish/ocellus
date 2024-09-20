import { drawControlLayer } from "./controls.js";
import { drawH3 } from "./h3.js";
import { drawTreatments } from "./treatments.js";
//import { addLayer, removeLayer } from "./utils.js";

function getBaseLayer({ origin, map }) {
    const baseLayerOpts = {
        minZoom: 1,
        maxZoom: 17,
        zoomOffset: -1,
        tileSize: 512
    }

    let baseLayer;

    if (origin === 'arcgis') {
        baseLayerOpts.attribution = '&copy; ESRI';
        baseLayer = L.tileLayer(
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
            baseLayerOpts
        ).addTo(map);
    }
    else if (origin === 'geodeo') {
        baseLayerOpts.vectorTileLayerStyles = {
            
            // A plain set of L.Path options.
            geojsonLayer: {
                weight: 1,
                color: '#000',
                fillColor: '#f5f5f5',
                fillOpacity: 1,
                fill: true
            }
        }

        baseLayer = L.vectorGrid.protobuf(
            'https://maps.zenodeo.org/countries-coastline-1m/{z}/{x}/{y}', 
            baseLayerOpts
        ).addTo(map);
    }
    else if (origin === 'gbif') {
        baseLayerOpts.attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> / &copy; <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>';
        const pixel_ratio = parseInt(window.devicePixelRatio) || 1;
        baseLayer = L.tileLayer(
            'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@{r}x.png?style=gbif-natural'.replace('{r}', pixel_ratio), 
            baseLayerOpts
        ).addTo(map);
    }

    return baseLayer
}

function initializeMap() {
    const initialMapCenter = [0, 0];
    const initialZoom = 2;
    const map = L.map('mapSearch').setView(initialMapCenter, initialZoom);

    // turn off the Ukrainian flag emoji
    map.attributionControl.setPrefix('');

    const mapLayers = {
        baseLayer: getBaseLayer({ origin: 'gbif', map })
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