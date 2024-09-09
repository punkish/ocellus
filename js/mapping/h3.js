async function getH3(resolution)  {
    const response = await fetch(`${globals.server}/bins/${resolution}`);

    // if HTTP-status is 200-299
    if (response.ok) {
        const grid = { "type": "FeatureCollection", "features": [] };
        const blackList = ['81033ffffffffff', '83f293fffffffff'];
        const json = await response.json();

        for (let [h3id, numOfTreatments] of Object.entries(json)) {

            if (!blackList.includes(h3id)) {
                const area = Math.round(
                    h3.cellArea(i, h3.UNITS.m2) / 1000000
                );

                const hexagon = {
                    "type": "Feature",
                    "properties": { 
                        numOfTreatments,
                        area,
                        density: Math.round(numOfTreatments / area)
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": []
                    }
                }
    
                hexagon.geometry.coordinates.push([]);
                const coords = h3.h3ToGeoBoundary(h3id); // lat, lng
                
                coords.forEach((c) => {
                    hexagon.geometry.coordinates[0].push([c[1], c[0]]);
                })

                grid.features.push(hexagon);
            }

        }

        fixTransmeridian(grid);
        return grid;
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status);
    }
}

async function drawH3(map, h3Layer) {
    const grid = await getH3(2);
    const min = 0;
    const max = 6600;

    const style = function(feature) {
        return { 
            fillColor: getH3Color(feature.properties.density, min, max)
                .fillColor,
            color: 'grey',
            weight: 1,
            fillOpacity: 0.6
        };
    }

    const h3Layer = L.geoJSON(
        grid, 
        {
            style, 
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: (e) => {
                        h3Layer.resetStyle(e.target);
                        //layers.H3info.update();
                    },
                    //click: zoomToFeature
                });
            }
        }
    );
    map.addLayer(h3Layer);
    // makeH3Info();
    // makeH3Legend(min, max);
}

function getH3Color(num, min, max) {
    const classes = getH3Classes(min, max);

    for (let i = 0, j = classes.length; i < j; i++) {
        if (num >= classes[i].from && num < classes[i].to) {
            return classes[i];
        }
    }
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
        classes.push({from, to, fillColor});
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