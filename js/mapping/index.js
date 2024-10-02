import { $, $$ } from '../base.js';
import { drawControlLayer } from "./controls.js";
import { drawH3 } from "./h3.js";
import { drawTreatments } from "./treatments.js";
//import { addLayer, removeLayer } from "./utils.js";
import { globals } from "../globals.js";

function makeCloseBtn(map) {
    L.Control.CloseButton = L.Control.extend({
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'close-btn');
            btn.addEventListener('click', function(e) {
                $('#map').classList.add('hidden');
                $('#not-map').classList.remove('hidden');
            });
            return btn;
        },
    
        onRemove: function(map) {
            // Nothing to do here
        }
    });
    
    L.control.closeButton = function(opts) {
        return new L.Control.CloseButton(opts);
    }
    
    L.control.closeButton({ position: 'topright' }).addTo(map);
}

// function makeInfoControl({ className, initialMsg }) {
//     console.log('making info control ' + className)
//     const infoControl = L.Control.extend({
//         onAdd: function(map) {
//             this._div = L.DomUtil.create('div', className);
//             this._div.innerHTML = initialMsg;
//             return this._div;
//         },
    
//         onRemove: function(map) {
//             // Nothing to do here
//         }
//     });
    
//     return infoControl;
// }

function getBaseLayer({ baseLayerSource, map }) {
    const baseLayerOpts = {
        minZoom: 1,
        maxZoom: 17,
        zoomOffset: -1,
        tileSize: 512
    }

    let baseLayer;

    if (baseLayerSource === 'arcgis') {
        baseLayerOpts.attribution = '&copy; ESRI';
        baseLayer = L.tileLayer(
            'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', 
            baseLayerOpts
        ).addTo(map);
    }
    else if (baseLayerSource === 'geodeo') {
        const layers = {
            'ne_50m_admin_1_states_provinces_lakes': {
                maxZoom: 2,
                tms: true,
                styles: {
                    weight: 1,
                    color: 'blue',
                    fillColor: '',
                    fillOpacity: 0.5,
                    fill: true
                }
            },
            'ne_50m_admin_0_countries': {
                maxZoom: 2,
                tms: true,
                styles: {
                    weight: 1,
                    color: '#444',
                    fillColor: 'f5f5f5',
                    fillOpacity: 0.25,
                    fill: true
                }
            },
            'ne_10m_admin_1_sel': {
                maxZoom: 5,
                tms: true,
                styles: {
                    weight: 1,
                    color: '#444',
                    fillColor: '#f5f5f5',
                    fillOpacity: 0.25,
                    fill: true
                }
            },
            'nev': {
                maxNativeZoom: 7,
                maxZoom: 10,
                tms: true,
                vectorTileLayerStyles: {
                    playa: {
                        stroke: true,
                        weight: 1,
                        color: 'aliceblue',
                        fillColor: 'aliceblue',
                        fillOpacity: 0.25,
                        fill: true
                    },
                    urban: {
                        stroke: true,
                        weight: 1,
                        color: 'bisque',
                        fillColor: 'bisque',
                        fillOpacity: 0.25,
                        fill: true
                    },
                    water: {
                        stroke: true,
                        weight: 1,
                        color: 'black',
                        fillColor: 'lightblue',
                        fillOpacity: 0.25,
                        fill: true
                    },
                    ice: function(properties) {
                        if (properties.type === 'glacier') {
                            return {
                                weight: 1,
                                color: 'white',
                                fillColor: 'white',
                                fillOpacity: 0.45,
                                fill: true
                            }
                        }
                        else if (properties.type === 'ice_shelf') {
                            return {
                                weight: 1,
                                color: 'white',
                                fillColor: 'lightgrey',
                                fillOpacity: 0.45,
                                fill: true
                            }
                        }
                    },
                    river: {
                        weight: 1,
                        color: 'blue',
                        fillColor: '',
                        fillOpacity: 1,
                        fill: false
                    },
                    railroad: {
                        stroke: true,
                        weight: 1,
                        color: 'brown'
                    },
                    road: {
                        weight: 1,
                        color: '#ffcc00',
                        fillColor: '',
                        fillOpacity: 1,
                        fill: false
                    },
                    country_label: {
                        stroke: false,
                        // color: 'black',
                        // weight: 0.5,
                        fill: false,
                        // fillColor: 'black',
                        // radius: 2
                    },
                    state_label: {
                        stroke: false,
                        fill: false
                    },
                    marine_label: {
                        stroke: false,
                        fill: false
                    },
                    lake_label: {
                        stroke: false,
                        fill: false
                    },
                    place_label: {
                        stroke: false,
                        fill: false
                    },
                    airport_label: {
                        stroke: false,
                        fill: false
                    },
                    port_label: {
                        stroke: false,
                        fill: false
                    },
                    admin: function(properties, zoom) {
                        const level = properties.admin_level;

                        if (level === 0) {
                            return {
                                weight: 1,
                                color: '#444',
                                // fillColor: 'red',
                                // fillOpacity: 0.25,
                                fill: false
                            }
                        }
                        else if (level === 1) {
                            return {
                                weight: 0.5,
                                color: '#444',
                                // fillColor: 'red',
                                // fillOpacity: 0.25,
                                fill: false
                            }
                        }
                        else if (level === 2) {
                            return {
                                weight: 1,
                                color: '#cf52d3',
                                dashArray: '2, 6',
                                fillColor: 'green',
                                fillOpacity: 0.25,
                                fill: true
                            }
                        }
                        
                    }
                }
            },
            'nev_raster': {
                maxZoom: 15,
                tms: true
            }
        }

        L.tileLayer(`${globals.mapServer}/nev_raster/{z}/{x}/{y}`, {
            maxNativeZoom: 6,
            maxZoom: 10,
            tms: true
        }).addTo(map);

        const layer = 'nev';
        const options = layers[layer];
        L.vectorGrid.protobuf(`${globals.mapServer}/${layer}/{z}/{x}/{y}`, options).addTo(map);
    }
    else if (baseLayerSource === 'gbif') {
        baseLayerOpts.attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> / &copy; <a href="https://www.openmaptiles.org/copyright">OpenMapTiles</a>';
        const pixel_ratio = parseInt(window.devicePixelRatio) || 1;
        baseLayer = L.tileLayer(
            'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@{r}x.png?style=gbif-natural'.replace('{r}', pixel_ratio), 
            baseLayerOpts
        ).addTo(map);
    }

    return baseLayer
}

function initializeMap({ mapContainer, baseLayerSource, drawControl }) {
    const map = globals.maps[mapContainer];

    if (map) {
        if (mapContainer === 'map') {
            $('#map').classList.remove('noblock');
        }
    }
    else {
        const initialMapCenter = [0, 0];
        const initialZoom = 2;
        const map = L.map(mapContainer).setView(initialMapCenter, initialZoom);
        globals.maps[mapContainer] = map;
        // turn off the Ukrainian flag emoji
        map.attributionControl.setPrefix('');

        // We store all the layers here so we can reference them later
        const mapLayers = {
            baseLayer: getBaseLayer({ baseLayerSource, map })
            // drawControls,
            // h3,
            // h3info
            // treatments,
            // treatmentInfo
        }

        if (drawControl) {
            drawControlLayer(map, mapLayers);
        }
        
        switchTreatments2H3(map, mapLayers);

        map.on('moveend', function(e) {
            switchTreatments2H3(map, mapLayers);
        });

        makeCloseBtn(map);
        // map.on('locationfound', onLocationFound);
        // map.on('locationerror', (e) => { alert(e.message) });
    }
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

export { 
    initializeMap, 
    //makeInfoControl 
}