import { globals } from './i-globals.js';

const getH3 = async () => {

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

    const response = await fetch('/js/treatments-density-h3-2.json');

    if (response.ok) {
        const json = await response.json();

        for (let [i, num] of Object.entries(json)) {
            if (!blackList.includes(i)) {
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

        fixTransmeridian(grid);

        const min = 0;
        const max = 5400;

        const style = function(feature) {
            return { 
                fillColor: getH3Color(feature.properties.density, min, max).fillColor,
                color: 'grey',
                weight: 1,
                fillOpacity: 0.6
            };
        }

        const map = globals.views.map;
        map.layers.h3.groups.grid2 = L.geoJSON(grid, {style, onEachFeature});
        map.obj.addLayer(map.layers.h3.groups.grid2);
        makeH3Info();
        makeH3Legend(min, max);
    }
}

const onEachFeature = (feature, layer) => {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        //click: zoomToFeature
    });
}

const highlightFeature = (e) => {
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

    const map = globals.views.map;
    map.layers.h3.controls.info.update(layer.feature.properties);
}

const resetHighlight = (e) => {
    const map = globals.views.map;
    map.layers.h3.groups.grid2.resetStyle(e.target);
    map.layers.h3.controls.info.update();
}


const makeH3Info = () => {
    const map = globals.views.map;
    map.layers.h3.controls.info = L.control();

    // create a div with a class "info"
    map.layers.h3.controls.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); 
        this.update();
        return this._div;
    };

    // this updates the control based on feature properties passed
    map.layers.h3.controls.info.update = function (props) {
        const str = props ? `${props.density} in ${props.area} km<sup>2</sup>` : 'Hover over a hexagon to see how many';
        this._div.innerHTML = `<b>Treatments<sup>*</sup></b><br><small><b>*</b><i>one treatment may be represented by more than one point</i></small><br>${str}`;
    };

    map.layers.h3.controls.info.addTo(map.obj);
}

/*
if (num >= 3237.5 &&  num < 3700) { fillColor = '#b10026' }
else if (num >= 2775 &&  num < 3237.5) { fillColor = '#e31a1c' }
else if (num >= 2312.5 &&  num < 2775) { fillColor = '#fc4e2a' }
else if (num >= 1850 &&  num < 2312.5) { fillColor = '#fd8d3c' }
else if (num >= 1387.5 &&  num < 1850) { fillColor = '#feb24c' }
else if (num >= 925 &&  num < 1387.5) { fillColor = '#fed976' }
else if (num >= 462.5 &&  num < 925) { fillColor = '#ffeda0' }
else if (num >= 0 &&  num < 462.5) { fillColor = '#ffffcc' }
*/
const makeH3Legend = (min, max) => {
    const map = globals.views.map;
    map.layers.h3.controls.legend = L.control({position: 'bottomright'});

    map.layers.h3.controls.legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
        const classes = getH3Classes(min, max);
        //const labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < classes.length; i++) {
            div.innerHTML += `<div class="interval">
                <div class="interval_color_tile interval_color_${i}" style:></div> <div class="interval_text">${classes[i].from}–${classes[i].to}</div>
            </div>`;
        }
    
        return div;
    };
    
    map.layers.h3.controls.legend.addTo(map.obj);
}

const fixTransmeridian = (feature) => {
    const {type} = feature;
    if (type === 'FeatureCollection') {
        feature.features.map(fixTransmeridian);
        return;
    }
    const {type: geometryType, coordinates} = feature.geometry;
    switch (geometryType) {
        case 'LineString':
            fixTransmeridianLoop(coordinates);
            return;
        case 'Polygon':
            fixTransmeridianPolygon(coordinates);
            return;
        case 'MultiPolygon':
            coordinates.forEach(fixTransmeridianPolygon);
            return;
        default:
            throw new Error(`Unknown geometry type: ${geometryType}`);
    }
}

const fixTransmeridianCoord = (coord) => {
    const lng = coord[0];
    coord[0] = lng < 0 ? lng + 360 : lng;
}

const fixTransmeridianLoop = (loop) => {
    let isTransmeridian = false;
    for (let i = 0; i < loop.length; i++) {

        // check for arcs > 180 degrees longitude, 
        // flagging as transmeridian
        if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
            isTransmeridian = true;
            break;
        }
    }

    if (isTransmeridian) {
        loop.forEach(fixTransmeridianCoord);
    }
}

const fixTransmeridianPolygon = (polygon) => {
    polygon.forEach(fixTransmeridianLoop);
}

const getH3Classes = (min, max) => {
    const range = max - min;
    const interval = range / globals.H3ColorRamp.length;
    let i = 0;
    const classes = [];
    
    for (let from = min; from < max; from = from + interval) {
        const to = from + interval;
        const fillColor = globals.H3ColorRamp[i];
        classes.push({from, to, fillColor})
        i++;
    }

    return classes;
}

const getH3Color = (num, min, max) => {
    const classes = getH3Classes(min, max);

    for (let i = 0, j = classes.length; i < j; i++) {
        if (num >= classes[i].from && num < classes[i].to) {
            return classes[i];
        }
    }
}

export { getH3 }