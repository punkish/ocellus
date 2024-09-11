import { drawControlLayer } from "./controls.js";
import { drawH3 } from "./h3.js";
import { drawTreatments } from "./treatments.js";
import { addLayer, removeLayer } from "./utils.js";

function initializeMap() {
    const initialMapCenter = [0, 0];
    const initialZoom = 2;
    const map = L.map('mapSearch').setView(initialMapCenter, initialZoom);

    // turn off the Ukrainian flag emoji
    map.attributionControl.setPrefix('');

    // set map source
    let mapSource = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    //mapSource = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    const baseLayerOpts = {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }

    const mapLayers = {
        baselayer: L.tileLayer(mapSource, baseLayerOpts).addTo(map),
        // drawControls: null,
        // h3: null,
        // treatments: null
    }

    drawControlLayer(map, mapLayers);
    switchTreatments2H3(map, mapLayers);

    map.on('moveend', function(e) {
        switchTreatments2H3(map, mapLayers);
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

function onLocationFound(e) {
    const radius = e.accuracy;
    const url = `${globals.server}/treatments?cols=latitude&cols=longitude&size=1000`;
    getTreatments(url);

    L.marker(e.latlng).addTo(map)
        .bindPopup(`You are within${radius}meters from this point`)
        .openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

export { initializeMap }