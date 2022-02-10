if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

'use strict';

O.map = {
    map: L.map( 'map-target', {
        center: [0, 0],
        //minZoom: 0,
        zoom: 2,

        // to fix popups and shift-drag on Safari
        // see https://github.com/Leaflet/Leaflet/issues/7266
        tap: false,
        autoPan: false
        // maxZoom: 18,
        // tileSize: 512,
        // zoomOffset: -1
    }),

    init: () => {
        O.map.layers.baselayer = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        });

        O.map.layers.baselayer.addTo( O.map.map );

        //const url = `${O.globals.zenodeo3Uri}/treatments?cols=latitude&cols=longitude&size=300000`;
        if (O.map.map.getZoom() <= 5) {

            // this will make H3 for the first time and add it to the map
            // it will also make H3Info and add it to the map
            O.map.getH3();
        }
        else {
            O.map.bounds = O.map.map.getBounds();
            O.map.getTreatments(O.map.bounds);
        }

        O.map.map.on('moveend', function(e) {
            const zoom = O.map.map.getZoom();
            const bounds = O.map.map.getBounds();
            
            if (zoom > 5) {
                
                O.map.removeLayerH3();

                if (O.map.bounds) {
                    if (O.map.bounds.contains(bounds)) {
                        if (!O.map.map.hasLayer(O.map.layers.treatments)) {
                            if (O.map.layers.treatments) {
                                O.map.map.addLayer(O.map.layers.treatments);
                            }
                            else {
                                O.map.getTreatments(bounds);
                            }
                        }
                    }
                    else {
                        O.map.bounds = bounds;
                        O.map.getTreatments(bounds);
                    }
                }
                else {
                    O.map.bounds = bounds;
                    O.map.getTreatments(bounds);
                }
            }
            else if (zoom <= 5) {
                O.map.removeLayerTreatments();
                if (O.map.layers.H3) {
                    O.map.addLayerH3();
                }
                else {
                    O.map.getH3();
                }
            }
        });
        //O.map.getTreatments(url);

        // O.map.map.locate({setView: true, maxZoom: 16});
        // O.map.map.on('locationfound', O.map.onLocationFound);
        // O.map.map.on('locationerror', O.map.onLocationError);
    },

    bounds: null,

    highlightFeature: (e) => {
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
    },

    resetHighlight: (e) => {
        O.map.layers.H3.resetStyle(e.target);
        O.map.layers.H3info.update();
    },

    onEachFeature: (feature, layer) => {
        layer.on({
            mouseover: O.map.highlightFeature,
            mouseout: O.map.resetHighlight,
            //click: zoomToFeature
        });
    },

    onLocationFound: (e) => {
        const radius = e.accuracy;
        const url = `${O.globals.zenodeo3Uri}/treatments?cols=latitude&cols=longitude&size=1000`;
        O.map.getTreatments(url);
    
        // L.marker(e.latlng).addTo(O.map.map)
        //     .bindPopup("You are within " + radius + " meters from this point").openPopup();
    
        // L.circle(e.latlng, radius).addTo(O.map.map);
    },

    onLocationError: (e) => {
        alert(e.message);
    },

    treatmentIcon: L.icon({ 
        iconUrl: '/img/treatment.svg', 
        iconSize: [24, 24],
        iconAnchor: [0, 0],
        popupAnchor: [13, 12]
    }),

    getTreatments: async (bounds) => {
        O.map.bounds = bounds;
        const min_lat = bounds.getSouthWest().lat;
        const min_lng = bounds.getSouthWest().lng;
        const max_lat = bounds.getNorthEast().lat;
        const max_lng = bounds.getNorthEast().lng;

        const url = `${O.globals.zenodeo3Uri}/treatments?location=containedIn({lowerLeft:{lat:${min_lat},lng:${min_lng}},upperRight:{lat:${max_lat},lng:${max_lng}}})&cols=treatmentTitle&cols=latitude&cols=longitude&size=1000`;

        const response = await fetch(url);
        
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const records = json.item.result.records;
  
            if (!O.map.layers.treatments) {
                O.map.layers.treatments = L.markerClusterGroup();
            }

            records.forEach((r) => {
                const latlng = new L.LatLng(r.latitude, r.longitude);
                const marker = L.marker(latlng, {icon: O.map.treatmentIcon});

                marker.bindPopup(() => {
                    const tid = r.treatmentId;
                    const url = `${O.globals.zenodeo3Uri}/treatments?treatmentId=${tid}&cols=httpUri&cols=captionText`;
                    const el = document.createElement('div');
                    el.classList.add("my-class");
                    const html = `<h4 class="popup">${r.treatmentTitle}</h4>`;

                    O.map.showMarker(url, tid, el, html);
                    return el;
                }, {autoPan: false});

                // const rrose = new L.Rrose({ offset: new L.Point(12,3), closeButton: false, autoPan: false }).setContent(() => {
                //     let html = `<h4 class="popup">${r.treatmentTitle}</h4>`;
                //     const el = document.createElement('div');
                //     el.classList.add("my-class");
                //     const tid = r.treatmentId;
                //     const showMarker = async (url, tid) => {
                //         const response = await fetch(url);
                //         if (response.ok) {
                //             const res = await response.json();
                //             const first = res.item.result.records[0];
                //             if (first.httpUri) {
                //                 html += `<figure>
                //                     <img src="${first.httpUri}" width="100">
                //                     <figcaption>${first.captionText} <a href="${O.globals.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
                //                 </figure>`;
                //             }
                //             else {
                //                 html += `<a href="${O.globals.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
                //             }
                            
                //             el.innerHTML = html;
                //         }
                //     };

                //     const url = `${O.globals.zenodeo3Uri}/treatments?treatmentId=${r.treatmentId}&cols=httpUri&cols=captionText`;
                //     showMarker(url, tid);
                //     return el;
                // });
                // marker.bindPopup(rrose);
                //map.addLayer(marker2);
                //marker2.openPopup();

                // map.on('drag', function() {
                //     rrose2.updateDirection();
                // });

                O.map.layers.treatments.addLayer(marker);
            });

            O.map.removeLayerH3();
            O.map.addLayerTreatments();
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status)
        }
    },

    showMarker: async (url, tid, el, html) => {
        const response = await fetch(url);
        if (response.ok) {
            const res = await response.json();
            const r = res.item.result.records[0];
            if (r.httpUri) {

                /*
                * Most figures are on Zenodo, but some are on Pensoft,
                * so the url has to be adjusted accordingly
                */
                const size = 250;
                const id = r.httpUri.split('/')[4];
                const i = r.httpUri.indexOf('zenodo') > -1 ? `${O.globals.zenodoUri}/${id}/thumb${size}` : r.httpUri;
                
                html += `<figure class="figure-${size}">
                    <picture>
                        <img src="../img/bug.gif" width="${size}" data-src="${i}" class="lazyload" data-recid="${id}">
                    </picture>
                    <figcaption>${r.captionText} <a href="${O.globals.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
                </figure>`;
            }
            else {
                html += `<a href="${O.globals.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
            }
            
            el.innerHTML = html;
        }
    },

    getH3: async () => {

        /*
         * structure of a hexagon in the geojson layer
         *
         * const hexagon = {
         *     "type": "Feature",
         *     "properties": {},
         *     "geometry": {
         *       "type": "Polygon",
         *       "coordinates": [
         *         [
         *           [ 4.921875, 9.795677582829743 ],
         *           [ 25.6640625, 10.833305983642491 ],
         *           …
         *         ]
         *       ]
         *     }
         * }
         * 
         */

        const grid = {
            "type": "FeatureCollection",
            "features": []
        }

        const blackList = ['81033ffffffffff', '83f293fffffffff'];

        const url = '/js/treatments-density-h3-1.json';
        const response = await fetch(url);

        if (response.ok) {
            const json = await response.json();

            for (let [i, num] of Object.entries(json)) {
                if (!blackList.includes(i)){
                    const hexagon = {
                        "type": "Feature",
                        "properties": { "density": num },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": []
                        }
                    }
        
                    hexagon.geometry.coordinates.push([]);
                    const coords = h3.h3ToGeoBoundary(i); // lat, lng
                    
                    coords.forEach((c) => {
                        hexagon.geometry.coordinates[0].push([c[1], c[0]]);
                    })
    
                    hexagon.properties.area = Math.round(h3.cellArea(i, h3.UNITS.m2) / 1000000);
                    grid.features.push(hexagon);
                }
            }

            O.map.fixTransmeridian(grid);

            const min = 0;
            const max = 6600;

            const style = function(feature) {
                return { 
                    fillColor: O.map.getH3Color(feature.properties.density, min, max).fillColor,
                    color: 'grey',
                    weight: 1,
                    fillOpacity: 0.6
                };
            }

            O.map.layers.H3 = L.geoJSON(grid, {style, onEachFeature: O.map.onEachFeature});
            O.map.map.addLayer(O.map.layers.H3);
            O.map.makeH3Info();
            O.map.makeH3Legend(min, max);
        }
    },

    H3ColorRamp: [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#b10026',
    ],

    getH3Classes: (min, max) => {
        const range = max - min;
        const interval = range / O.map.H3ColorRamp.length;
        let i = 0;
        const classes = [];
        
        for (let from = min; from < max; from = from + interval) {
            const to = from + interval;
            const fillColor = O.map.H3ColorRamp[i];
            classes.push({from, to, fillColor})
            i++;
        }
    
        return classes;
    },

    getH3Color: (num, min, max) => {
        const classes = O.map.getH3Classes(min, max);
    
        for (let i = 0, j = classes.length; i < j; i++) {
            if (num >= classes[i].from && num < classes[i].to) {
                return classes[i];
            }
        }
    },

    makeH3Info: () => {
        O.map.layers.H3info = L.control();

        // create a div with a class "info"
        O.map.layers.H3info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); 
            this.update();
            return this._div;
        };

        // this updates the control based on feature properties passed
        O.map.layers.H3info.update = function (props) {
            const str = props ? `${props.density} in ${props.area} km<sup>2</sup>` : 'Hover over a hexagon to see how many';
            this._div.innerHTML = `<b>Treatments<sup>*</sup></b><br><small><b>*</b><i>one treatment may be represented by more than one point</i></small><br>${str}`;
        };

        O.map.layers.H3info.addTo(O.map.map);
    },

    makeH3Legend: (min, max) => {
        O.map.layers.H3legend = L.control({position: 'bottomright'});

        O.map.layers.H3legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'info legend');
            const classes = O.map.getH3Classes(min, max);
            //const labels = [];
        
            // loop through our density intervals and generate a label with a colored square for each interval
            for (let i = 0; i < classes.length; i++) {
                div.innerHTML += `<div class="interval">
                    <div class="interval_color_tile interval_color_${i}" style:></div> <div class="interval_text">${classes[i].from}–${classes[i].to}</div>
                </div>`;
            }
        
            return div;
        };
        
        O.map.layers.H3legend.addTo(O.map.map);
    },

    addLayerH3: () => {
        if (!O.map.map.hasLayer(O.map.layers.H3)) { 
            O.map.map.addLayer(O.map.layers.H3);
            O.map.layers.H3info.addTo(O.map.map);
            O.map.layers.H3legend.addTo(O.map.map);
        }
    },

    removeLayerH3: () => {
        if (O.map.map.hasLayer(O.map.layers.H3)) {
            O.map.map.removeLayer(O.map.layers.H3);
            O.map.layers.H3info.remove();
            O.map.layers.H3legend.remove();
        }
    },

    addLayerTreatments: () => {
        if (!O.map.map.hasLayer(O.map.layers.treatments)) {
            O.map.map.addLayer(O.map.layers.treatments);
        }
    },

    removeLayerTreatments: () => {
        if (O.map.map.hasLayer(O.map.layers.treatments)) {
            O.map.map.removeLayer(O.map.layers.treatments);
        }
    },

    layers: {},

    // 510M sq kms
    

    // https://www.math.net/area-of-a-hexagon
    hexarea: (side) => 3 * Math.sqrt(3) * side * side / 2,

    output: (side, grid) => {
        const EARTH = 510000000;
        const area_of_hex = O.map.hexarea(side);
        console.log(`area of hexagon of side ${side} kms: ${area_of_hex}`);
        console.log(`number of hexagons to cover the earth: ${EARTH / area_of_hex}`);
        console.log(`num of hexagons generated by turf: ${grid.features.length}`);
    },

    fixTransmeridian: (feature) => {
        const {type} = feature;
        if (type === 'FeatureCollection') {
            feature.features.map(O.map.fixTransmeridian);
            return;
        }
        const {type: geometryType, coordinates} = feature.geometry;
        switch (geometryType) {
            case 'LineString':
                O.map.fixTransmeridianLoop(coordinates);
                return;
            case 'Polygon':
                O.map.fixTransmeridianPolygon(coordinates);
                return;
            case 'MultiPolygon':
                coordinates.forEach(O.map.fixTransmeridianPolygon);
                return;
            default:
                throw new Error(`Unknown geometry type: ${geometryType}`);
        }
    },
    
    fixTransmeridianCoord: (coord) => {
        const lng = coord[0];
        coord[0] = lng < 0 ? lng + 360 : lng;
    },
    
    fixTransmeridianLoop: (loop) => {
        let isTransmeridian = false;
        for (let i = 0; i < loop.length; i++) {
            // check for arcs > 180 degrees longitude, flagging as transmeridian
            if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
                isTransmeridian = true;
                break;
            }
        }
        if (isTransmeridian) {
            loop.forEach(O.map.fixTransmeridianCoord);
        }
    },
    
    fixTransmeridianPolygon: (polygon) => {
        polygon.forEach(O.map.fixTransmeridianLoop);
    }
}