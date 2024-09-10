import { globals } from "../globals.js";
import { addLayer, removeLayer } from "./utils.js";

async function getH3(resolution)  {
    const response = await fetch(`${globals.server}/bins/${resolution}`);

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
        removeLayer(map, mapLayers, 'treatments');
    }

    if ('h3' in mapLayers) {
        addLayer(map, mapLayers.h3);
    }
    else {
        const grid = await getH3(3);
        const densities = grid.features.map(feature => feature.properties.density);
        let max = Math.max(...densities);
        let min = Math.min(...densities);
        const c = 1 / min;
        max = Math.ceil(max * c);
        min = Math.floor(min * c);
        const classes = getH3Classes(min, max);

        const style = function(feature) {
            let fillColor = '#f5f5f5';
            let fillOpacity = 0;
            const num = feature.properties.density * c;

            if (num > 0) {
                fillColor = getFillColor(num, classes);
                fillOpacity = 0.2;
            }
                
            return { 
                fillColor,
                color: 'grey',
                weight: 1,
                fillOpacity
            };
        }
    
        removeLayer(map, mapLayers, 'h3');
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
        
        addLayer(map, mapLayers.h3);
        makeH3Info(map, mapLayers);
        makeH3Legend(map, mapLayers, classes);
    }

}

function highlightBin({ mapLayers, bin }) {
    // const bin = e.target;
                        
    // bin.setStyle({
    //     weight: 2,
    //     color: '#666',
    //     dashArray: '',
    //     fillOpacity: 0.1
    // });

    // if (
    //     !L.Browser.ie && 
    //     !L.Browser.opera && 
    //     !L.Browser.edge
    // ) {
    //     bin.bringToFront();
    // }

    mapLayers.h3info.update(bin.feature.properties);
}

function resetBin({ mapLayers, bin }) {
    //mapLayers.h3.resetStyle(bin);
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
    mapLayers.h3info = L.control();

    // create a div with a class "info"
    mapLayers.h3info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); 
        this.update();
        return this._div;
    };

    // this updates the control based on feature properties passed
    mapLayers.h3info.update = function (props) {
        this._div.innerHTML = props 
            ? `${props.numOfTreatments} treatments in ${props.area} km<sup>2</sup>` 
            : 'Hover over a bin to see num of treatments';

        //this._div.innerHTML = `<b>Treatments<sup>*</sup></b><br><small><b>*</b><i>one treatment may be represented by more than one point</i></small><br>${str}`;
        
    };

    mapLayers.h3info.addTo(map);
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