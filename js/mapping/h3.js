import { globals } from "../globals.js";
//import { makeInfoControl } from './index.js';

async function getH3(resolution)  {
    const url = `${globals.uri.zenodeo}/bins/${resolution}`;
    const response = await fetch(url, globals.fetchOpts);

    // if HTTP-status is 200-299
    if (response.ok) {
        const grid = { "type": "FeatureCollection", "features": [] };
        const blackList = ['81033ffffffffff', '83f293fffffffff'];
        const json = await response.json();
        blackList.forEach(b => delete json[b]);

        for (const [h3id, numOfTreatments] of Object.entries(json)) {
            const area = Math.round(h3.cellArea(h3id, h3.UNITS.km2));
            const coords = h3.cellToBoundary(h3id); // lat, lng
            const coordinates = coords.map(c => [c[1], c[0]]); // lng, lat

            const hexagon = {
                "type": "Feature",
                "properties": { 
                    numOfTreatments,
                    area,
                    "density": numOfTreatments / area
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ coordinates ]
                }
            }

            grid.features.push(hexagon);
        }

        fixTransmeridian(grid);
        return grid;
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

async function drawH3(map, mapLayers) {

    if ('treatments' in mapLayers) {
        map.removeLayer(mapLayers.treatments);
        //mapLayers.treatmentInfo.remove();
    }

    if ('h3' in mapLayers) {
        map.addLayer(mapLayers.h3);
        //map.addLayer(mapLayers.h3info);
        mapLayers.h3info.addTo(map);
    }
    else {
        const grid = await getH3(3);
        const densities = grid.features.map(feature => feature.properties.density);
        //let max = Math.max(...densities);
        const min = Math.min(...densities); 

        // Since densities are very small numbers, and min is less than 1,
        // we scale both min and max to be more than 1
        const c = 1 / min;
        // max = Math.ceil(max * c);
        // min = Math.floor(min * c);

        //const classes = getH3Classes(min, max);
        const colorRamp = [
            '#ffffcc',
            '#ffeda0',
            '#fed976',
            '#feb24c',
            '#fd8d3c',
            '#fc4e2a',
            '#e31a1c',
            '#b10026',
        ];
        const classes = binIt({ 
            data: densities, 
            scaleFactor: c,
            colorRamp, 
            typeOfBins: 'equalFreq' 
        });

        /*
        [
            { from: 0, to: 1, fillColor: '#ffffcc', num: 3 },
            { from: 2, to: 4, fillColor: '#ffeda0', num: 3 },
            { from: 5, to: 6, fillColor: '#fed976', num: 3 },
            { from: 7, to: 8, fillColor: '#feb24c', num: 3 },
            { from: 8, to: 10, fillColor: '#fd8d3c', num: 3 },
            { from: 11, to: 13, fillColor: '#fc4e2a', num: 3 },
            { from: 13, to: 57, fillColor: '#e31a1c', num: 3 },
            { from: 99, to: 100, fillColor: '#b10026', num: 3 }
        ]
        */

        const style = function(feature) {
            let fillColor = '#f5f5f5';
            let fillOpacity = 0;
            const num = feature.properties.density * c;

            if (num > 0) {
                fillColor = getFillColor(num, classes);
                fillOpacity = 0.7;
            }
                
            return { 
                fillColor,
                color: 'grey',
                weight: 0,
                fillOpacity
            };
        }
    
        mapLayers.h3 = L.geoJSON(
            grid, 
            {
                style, 
                onEachFeature: (feature, layer) => {
                    layer.on({
                        mouseover: (e) => { 
                            highlightBin({ mapLayers, bin: e.target }) 
                        },
                        mouseout: (e) => { 
                            resetBin({ mapLayers, bin: e.target }) 
                        },
                        //click: zoomToFeature
                    });
                }
            }
        );
        
        map.addLayer(mapLayers.h3);
        makeH3Info(map, mapLayers);
    }

}

function highlightBin({ mapLayers, bin }) {                        
    bin.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.1
    });

    if (
        !L.Browser.ie && 
        !L.Browser.opera && 
        !L.Browser.edge
    ) {
        bin.bringToFront();
    }

    mapLayers.h3info.update(bin.feature.properties);
}

function resetBin({ mapLayers, bin }) {
    mapLayers.h3.resetStyle(bin);
    mapLayers.h3info.update();
}

function getFillColor(num, classes) {
    for (let i = 0, j = classes.length; i < j; i++) {
        if (num >= classes[i].from && num < classes[i].to) {
            return classes[i].fillColor;
        }
    }
}

function makeH3Info(map, mapLayers) {
    const h3info = L.control();
    const initialMsg = 'Hover over a bin to see num of images';

    // create a div with a class "info"
    h3info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'h3info');
        this._div.innerHTML = initialMsg;
        //this.update();
        return this._div;
    };

    // const h3info = makeInfoControl({
    //     className: 'h3info',
    //     initialMsg
    // });

    // this updates the control based on feature properties passed
    h3info.update = function (props) {

        this._div.innerHTML = props
            ? `${props.numOfTreatments} treatments in ${props.area} km<sup>2</sup>`
            : initialMsg;

    };

    mapLayers.h3info = h3info;
    h3info.addTo(map);
}

function makeH3Legend(map, mapLayers, classes) {
    mapLayers.h3legend = L.control({ position: 'bottomright' });

    mapLayers.h3legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'info legend');
    
        // loop through our density intervals and generate a label with a 
        // colored square for each interval
        div.innerHTML = classes.map((c, i) => {
            return `<div class="interval">
                <div class="interval_color_tile interval_color_${i}"></div> 
                <div class="interval_text">${c.from}–${c.to}</div>
            </div>`
        }).join('');
    
        return div;
    };
    
    mapLayers.h3legend.addTo(map);
}

function getH3Classes(min, max) {
    const H3ColorRamp = [
        '#ffffcc',
        '#ffeda0',
        '#fed976',
        '#feb24c',
        '#fd8d3c',
        '#fc4e2a',
        '#e31a1c',
        '#b10026',
    ];

    const range = max - min;
    const interval = range / H3ColorRamp.length;
    let i = 0;
    const classes = [];
    
    for (let from = min; from < max; from = from + interval) {
        const to = from + interval;
        const fillColor = H3ColorRamp[i];
        classes.push({
            from: Math.round(from), 
            to: Math.round(to), 
            fillColor
        });
        i++;
    }

    return classes;
}

function binIt({ data, scaleFactor, colorRamp, typeOfBins }) {
    const numOfBins = colorRamp.length;
    const classes = [];

    if (typeOfBins === 'equalWidth') {
        const densities = Object.values(data);
        const total = densities.reduce((a, b) => a + b);
        const max = Math.max(...densities) + 1;
        const min = Math.min(...densities); 
        const range = max - min;
        const interval = range / numOfBins;
        let i = 0;
    
        for (let from = min; from < max; from = from + interval) {
            const to = from + interval;
            const fillColor = colorRamp[i];
            classes.push({
                from: Math.round(from), 
                to: Math.round(to), 
                fillColor,
                num: 0
            });
            i++;
        }

        classes.forEach(c => {
            c.num = Object.values(data)
                .filter(d => d >= c.from && d < c.to)
                .length;
        })
        
    }
    else if (typeOfBins === 'equalFreq') {

        // Number of data points (616701)
        const numOfData = Object.keys(data).length;

        // Number of data points per class interval (1777)
        const numPerClass = Math.round(numOfData / numOfBins);

        // We want to order the data points by value. But since data is an 
        // object, we convert it to an array so we can sort it. The keys are 
        // mapped to 'id' and the values are mapped to 'num'. So we go from
        //
        // { 'dsatwsdf': 2340, 'fdsgsas5': 43 }
        // to
        // [
        //      { id: 'dsatwsdf', num: 2340 },
        //      { id: 'fdsgsas5', num: 43 }
        // ]
        // and then sorted to
        // [
        //      { id: 'fdsgsas5', num: 43 },
        //      { id: 'dsatwsdf', num: 2340 }
        // ]
        const tmp = [];

        for (const [key, val] of Object.entries(data)) {
            tmp.push({ id: key, num: Math.round(val * scaleFactor) });
        }

        const orderedData = tmp.sort((a, b) => a.num - b.num);
        // const nums = tmp.map(t => t.num);
        // const max = Math.max(...nums) + 1;
        // const min = Math.min(...nums); 
        // const total = nums.reduce((a, b) => a + b);

        // console.log(`min: ${min}, max: ${max}, total: ${total}, numPerClass: ${numPerClass}, numOfBins: ${numOfBins}`);

        for (let i = 0; i < numOfBins; i++) {
            const a = i * numPerClass;
            const b = a + numPerClass;
            const tmp = orderedData.slice(a, b);
            const from = tmp[0].num;
            const to = tmp[ tmp.length - 1 ].num;
            classes[i] = {
                from,
                to,
                fillColor: colorRamp[i],
                num: tmp.length
            }
        }
    }
    
    //console.log(classes);
    return classes;
}

function fixTransmeridian(feature) {
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
            coordinates.forEach(polygon => fixTransmeridianPolygon(polygon));
            return;

        default:
            throw new Error(`Unknown geometry type: ${geometryType}`);
    }
}

function fixTransmeridianCoord(coord) {
    const lng = coord[0];
    coord[0] = lng < 0 
        ? lng + 360 
        : lng;
}

function fixTransmeridianLoop(loop) {
    let isTransmeridian = false;

    for (let i = 0; i < loop.length; i++) {

        // check for arcs > 180 degrees longitude, flagging as transmeridian
        if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
            isTransmeridian = true;
            break;
        }
    }

    if (isTransmeridian) {
        loop.forEach(coord => fixTransmeridianCoord(coord));
    }
}

function fixTransmeridianPolygon(polygon) {
    polygon.forEach(loop => fixTransmeridianLoop(loop));
}

export { drawH3 }