import { globals } from './i-globals.js';
import { getH3 } from './i-h3.js';

const makeMap = () => {
    const map = globals.views.map;
    map.obj = L.map('map', {
        center: [0, 0],
        zoom: 3,
    
        // to fix popups and shift-drag on Safari
        // see https://github.com/Leaflet/Leaflet/issues/7266
        tap: false,
        autoPan: false
    })

    map.layers.baselayer.groups.osm = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a','b','c']
    });

    map.layers.baselayer.groups.osm.addTo(map.obj);

    if (map.obj.getZoom() <= 5) {

        // this will make H3 for the first time and add it to the map
        // it will also make H3Info and add it to the map
        getH3();
    }
    else {
        map.bounds = map.obj.getBounds();
        getTreatments(map.bounds);
    }

    map.obj.on('moveend', onMoveEnd);
}

const onMoveEnd = (e) => {
    const map = globals.views.map;
    const zoom = map.obj.getZoom();
    const current_bounds = map.obj.getBounds();
    
    if (zoom > 5) {
        removeLayer('H3');

        if (map.bounds) {
            if (map.bounds.contains(current_bounds)) {
                if (!map.obj.hasLayer(map.layers.treatmentsInWater)) {
                    if (map.layers.treatmentsInWater) {
                        map.obj.addLayer(map.layers.treatmentsInWater);
                        map.obj.addLayer(map.layers.treatmentsOnLand);
                    }
                    else {
                        getTreatments(map.bounds);
                    }
                }
            }
            else {
                map.bounds = current_bounds;
                getTreatments(map.bounds);
            }
        }
        else {
            map.bounds = current_bounds;
            getTreatments(map.bounds);
        }
    }
    else if (zoom <= 5) {
        removeLayer('treatmentsInWater');
        removeLayer('treatmentsOnLand');
        
        if (map.layers.h3) {
            addLayer('h3');
        }
        else {
            getH3();
        }
    }
}

const getResource = async ({ resource, queryString }) => {
    const url = `${O.zenodeo3Uri}/${resource}?${queryString}`;

    const response = await fetch(url);

    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();

        if (json.item.search.cols === '') {
            return json.item.result.count;
        }       
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

const getTreatments = async (bounds) => {
    const map = globals.views.map;
    map.bounds = bounds;
    const min_lat = map.bounds.getSouthWest().lat;
    const min_lng = map.bounds.getSouthWest().lng;
    const max_lat = map.bounds.getNorthEast().lat;
    const max_lng = map.bounds.getNorthEast().lng;

    const url = `${O.zenodeo3Uri}/materialscitations?geolocation=containedIn({lowerLeft:{lat:${min_lat},lng:${min_lng}},upperRight:{lat:${max_lat},lng:${max_lng}}})&cols=treatmentId&cols=latitude&cols=longitude&cols=isOnLand&size=1000`;

    const response = await fetch(url);
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        const records = json.item.result.records;

        // we divide the retrieved points into two layers, sea and land
        const treatments = map.layers.treatments;
        if (!treatments.groups.treatmentsOnLand) {
            treatments.groups.treatmentsOnLand = L.markerClusterGroup();
        }

        if (!treatments.groups.treatmentsInWater) {
            treatments.groups.treatmentsInWater = L.markerClusterGroup();
        }

        records.forEach((r) => {
            const latlng = new L.LatLng(r.latitude, r.longitude);
            const marker = L.marker(latlng, {
                icon: L.icon(globals.treatmentIcon)
            });

            marker.bindPopup(() => {
                const tid = r.treatmentId;
                const url = `${O.zenodeo3Uri}/treatments?treatmentId=${tid}&cols=treatmentTitle&cols=httpUri&cols=captionText`;
                const el = document.createElement('div');
                el.classList.add("my-class");

                const html = r.isOnLand ? '' : '🌊';

                showMarker(url, tid, el, html);
                return el;
            }, {autoPan: false});

            if (r.isOnLand) {
                treatments.groups.treatmentsOnLand.addLayer(marker);
            }
            else {
                treatments.groups.treatmentsInWater.addLayer(marker);
            }
        });

        if (!treatments.controls.layerControl) {
            treatments.controls.layerControl = L.control.layers({
                "on land" : treatments.groups.treatmentsOnLand,
                "in water": treatments.groups.treatmentsInWater
            })
        }

        removeLayer('h3');
        addLayer('treatments');
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

const showMarker = async (url, tid, el, html) => {
    const response = await fetch(url);
    if (response.ok) {
        const res = await response.json();
        const r = res.item.result.records[0];
        html = `<h4>${r.treatmentTitle} ` + html + '</h4>';
        if (r.httpUri) {

            /*
            * Most figures are on Zenodo, but some are on Pensoft,
            * so the url has to be adjusted accordingly
            */
            const size = 250;
            const id = r.httpUri.split('/')[4];
            const i = r.httpUri.indexOf('zenodo') > -1 ? `${globals.zenodoUri}/${id}/thumb${size}` : r.httpUri;
            
            html += `<figure class="figure-${size}">
                <picture>
                    <img src="../img/bug.gif" width="${size}" data-src="${i}" class="lazyload" data-recid="${id}">
                </picture>
                <figcaption>${r.captionText} <a href="${O.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
            </figure>`;
        }
        else {
            html += `<a href="${O.zenodeo3Uri}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
        }
        
        el.innerHTML = html;
    }
}

const removeLayer = (layerName) => {
    const map = globals.views.map;

    // if layer exists
    if (map.layers[layerName]) {

        // first remove any layergroups for this name
        const groups = map.layers[layerName].groups;
        for (let [name, obj] of Object.entries(groups)) {
            map.obj.removeLayer(obj);
        }
        
        // now remove any controls or dependents
        const controls = map.layers[layerName].controls;
        for (let [name, obj] of Object.entries(controls)) {
            obj.remove();
        }
    }
}

const addLayer = (layerName) => {
    const map = globals.views.map;

    // if layer exists
    if (map.layers[layerName]) {

        // first add any layergroups for this name
        const groups = map.layers[layerName].groups;
        for (let [name, obj] of Object.entries(groups)) {
            map.obj.addLayer(obj);
        }
        
        // now add any controls or dependents
        const controls = map.layers[layerName].controls;
        for (let [name, obj] of Object.entries(controls)) {
            obj.addTo(map.obj);
        }
    }
}

export { makeMap, getTreatments, getResource }