import { globals } from "../globals.js";
import { addLayer, removeLayer } from "./utils.js";

/**
 * retrieves treatments within the provided bounds
 */
async function getTreatments(bounds) {
    const min_lat = bounds.getSouthWest().lat;
    const min_lng = bounds.getSouthWest().lng;
    const max_lat = bounds.getNorthEast().lat;
    const max_lng = bounds.getNorthEast().lng;

    const url = `${globals.server}/treatments?geolocation=within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})&cols=treatmentTitle&cols=latitude&cols=longitude&size=1000`;

    const response = await fetch(url);
    
    // if HTTP-status is 200-299
    if (response.ok) {
        const json = await response.json();
        return json.item.result.records;
    }

    // throw an error
    else {
        alert("HTTP-Error: " + response.status)
    }
}

async function drawTreatments(map, mapLayers) {
    console.log('drawing treatments')

    if ('h3' in mapLayers) {
        removeLayer(map, mapLayers, 'h3');
    }

    if ('treatments' in mapLayers) {
        addLayer(map, mapLayers.treatments);
    }
    else {
        const bounds = map.getBounds();
        const treatments = await getTreatments(bounds);

        //removeLayer(map, mapLayers, 'treatments');
        mapLayers.treatments = L.markerClusterGroup();

        const icon = L.icon({ 
            iconUrl: '/img/treatment.svg', 
            iconSize: [24, 24],
            iconAnchor: [0, 0],
            popupAnchor: [13, 12]
        });

        treatments.forEach((r) => {
            const latlng = new L.LatLng(r.latitude, r.longitude);
            const marker = L.marker(latlng, { icon });

            const tid = r.treatmentId;
            const url = `${globals.server}/images?treatmentId=${tid}&cols=httpUri&cols=captionText`;
            const el = document.createElement('div');
            el.classList.add("my-class");
            const html = `<h4 class="popup">${r.treatmentTitle}</h4>`;

            marker.bindPopup(() => {
                showMarker(url, tid, el, html);
                return el;
            });

            mapLayers.treatments.addLayer(marker);
        });

        addLayer(map, mapLayers.treatments);
    }

}

async function showMarker(url, tid, el, html) {
    const response = await fetch(url);

    if (response.ok) {
        const res = await response.json();
        const r = res.item.result.records[0];
        if (r.httpUri) {

            // Most figures are on Zenodo, but some are on Pensoft,
            // so the url has to be adjusted accordingly
            // 
            const size = 250;
            const id = r.httpUri.split('/')[4];
            const i = r.httpUri.indexOf('zenodo') > -1 ? `${globals.server}/${id}/thumb${size}` : r.httpUri;
            
            html += `<figure class="figure-${size}">
                <picture>
                    <img src="../img/bug.gif" width="${size}" data-src="${i}" class="lazyload" data-recid="${id}">
                </picture>
                <figcaption>${r.captionText} <a href="${globals.server}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
            </figure>`;
        }
        else {
            html += `<a href="${globals.server}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
        }
        
        el.innerHTML = html;
    }
}

export { drawTreatments }