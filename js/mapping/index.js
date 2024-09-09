import { drawControlLayer } from "./controls";
import { drawH3 } from "./h3";
import { drawTreatments } from "./treatments";
import { addLayer, removeLayer } from "./utils";

function initializeMap() {
    const initialMapCenter = [0, 0];
    const initialZoom = 2;
    const map = L.map('mapSearch').setView(initialMapCenter, initialZoom);

    // turn off the Ukrainian flag emoji
    map.attributionControl.setPrefix('');

    // set map source
    let mapSource = 'http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    //mapSource = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    const baseLayerOpts = {
        maxZoom: 19, 
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }

    const mapLayers = {
        baselayer: L.tileLayer(mapSource, baseLayerOpts).addTo(map),
        drawControls: null,
        h3: null,
        treatments: null
    }

    drawControlLayer(map, mapLayers);
    switchTreatments2H3(map, mapLayers);

    map.on('moveend', function(e) {
        switchTreatments2H3(map, mapLayers);
    });
}

function switchTreatments2H3(map, layers) {
    const zoom = map.getZoom();
    removeLayer(layers.h3);

    if (zoom <= 5) {
        
        // this will make H3 for the first time and add it to the map
        // it will also make H3Info and add it to the map
        drawH3(map, layers.h3);
    }
    else {
        drawTreatments(map, layers.treatments);
    }
}

export { initializeMap }


function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.8
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    O.map.layers.H3info.update(layer.feature.properties);
}

function resetHighlight(e) {
    O.map.layers.H3.resetStyle(e.target);
    O.map.layers.H3info.update();
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

function onLocationError(e) {
    alert(e.message);
}