import { $, $$ } from '../base.js';
import { drawControlLayer } from "./controls.js";
import { drawH3 } from "./h3.js";
import { drawImageMarkers } from "./imageMarkers.js";
import { globals } from "../globals.js";
import { getMapLocation, setupMap } from '../leaflet-hash.js';

async function getBaseLayer({ baseLayerSource, map }) {
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

        const url = `${globals.uri.maps}/nev_raster/{z}/{x}/{y}`;
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
        L.tileLayer(url, {
            maxNativeZoom: 6,
            maxZoom: 10,
            tms: true
        }).addTo(map);

        const layer = 'nev';
        const options = layers[layer];
        L.vectorGrid.protobuf(`${globals.uri.maps}/${layer}/{z}/{x}/{y}`, options).addTo(map);
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

async function initializeMap({ mapContainer, baseLayerSource }) {
    const mapOptions = { preferCanvas: true };
    let northEast = {lat: 72, lng: 124};
    let southWest = {lat: -60, lng: -124};
    let zoom = 5;
    let lat = 0;
    let lng = 0;
    let treatmentId;

    if (mapContainer === 'map') {
        const ml = getMapLocation({ zoom, lat, lng });

        zoom = ml.zoom;
        lat = ml.lat;
        lng = ml.lng;
        treatmentId = ml.treatmentId;

        northEast = {lat: 61.6, lng: 131.48};
        southWest = {lat: -31.95, lng: -137.11};
    }
    
    const bounds = L.latLngBounds(northEast, southWest);
    const map = L.map(mapContainer, mapOptions).setView({ lat, lng }, zoom);

    // turn off the Ukrainian flag emoji
    map.attributionControl.setPrefix('');
        
    L.easyButton('.', () => map.fitBounds(bounds)).addTo(map);
        
    if (mapContainer === 'map') {
        setupMap(map);
        
        map.on('moveend', async function(e) {
            await switchLayers(map, mapLayers);
        });

        // We store all the layers here so we can reference them later
        const mapLayers = {
            baseLayer: getBaseLayer({ baseLayerSource, map }),
        }
        
        await switchLayers(map, mapLayers, treatmentId);
    }
    else if (mapContainer === 'mapSearch') {
        map.on('moveend', async function(e) {
            drawH3(map, mapLayers);
        });

        // We store all the layers here so we can reference them later
        const mapLayers = {
            baseLayer: getBaseLayer({ baseLayerSource, map }),
        }

        drawControlLayer(map, mapLayers);
        drawH3(map, mapLayers);
    }
}

async function switchLayers(map, mapLayers, treatmentId) {
    const zoom = map.getZoom();
    
    if (zoom <= 5) {
        drawH3(map, mapLayers);
    }
    else {
        await drawImageMarkers(map, mapLayers, treatmentId);
    }
}

export { initializeMap }