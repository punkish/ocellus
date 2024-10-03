import { globals } from "../globals.js";

/**
 * retrieves treatments within the provided bounds
 */
async function getTreatments(bounds) {
    const min_lat = bounds.getSouthWest().lat;
    const min_lng = bounds.getSouthWest().lng;
    const max_lat = bounds.getNorthEast().lat;
    const max_lng = bounds.getNorthEast().lng;

    const url = `${globals.uri.zenodeo}/images?geolocation=within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})&cols=treatmentId&cols=treatmentTitle&cols=latitude&cols=longitude&size=5000`;

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
        map.removeLayer(mapLayers.h3);
        mapLayers.h3info.remove();
    }

    if ('treatments' in mapLayers) {
        map.addLayer(mapLayers.treatments);
        mapLayers.treatmentInfo.addTo(map);
    }
    else {
        makeTreatmentInfo(map, mapLayers);
        const bounds = map.getBounds();
        const treatments = await getTreatments(bounds);
        mapLayers.treatments = L.markerClusterGroup();

        const icon = L.icon({ 
            iconUrl: '/img/treatment.svg', 
            iconSize: [24, 24],
            iconAnchor: [0, 0],
            popupAnchor: [13, 12]
        });

        treatments.forEach((treatment) => {
            const latlng = new L.LatLng(
                treatment.latitude, 
                treatment.longitude
            );
            const marker = L.marker(latlng, { icon });
            marker.on('click', function (e) {
                mapLayers.treatmentInfo.update(treatment)
            });
            mapLayers.treatments.addLayer(marker);
        });

        map.addLayer(mapLayers.treatments);
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
            const i = r.httpUri.indexOf('zenodo') > -1 
                ? `${globals.server}/${id}/thumb${size}` 
                : r.httpUri;
            
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

function makeTreatmentInfo(map, mapLayers) {
    const treatmentInfo = L.control();
    const initialMsg = 'Click on a treatment to for more info';

    // create a div with a class "info"
    treatmentInfo.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'treatmentInfo'); 
        this._div.id = 'treatmentInfo';
        //this.update();
        this._div.innerHTML = initialMsg;
        return this._div;
    };
    

    // const treatmentInfo = makeInfoControl({
    //     className: 'treatmentInfo',
    //     initialMsg
    // });

    // this updates the control based on the feature passed
    treatmentInfo.update = async function (treatment) {

        if (treatment) {
            const tid = treatment.treatmentId;
            const url = `${globals.server}/images?treatmentId=${tid}&cols=httpUri&cols=caption`;
            let html = `<h4 class="popup">${treatment.treatmentTitle}</h4>`;

            const response = await fetch(url);

            if (response.ok) {
                const res = await response.json();
                const rec = res.item.result.records[0];
                if (rec.httpUri) {

                    // Most figures are on Zenodo, but some are on Pensoft,
                    // so the url has to be adjusted accordingly
                    // 
                    const size = 250;
                    const id = rec.httpUri.split('/')[4];
                    // if the figure is on zenodo, show their thumbnails unless 
                    // it is an svg, in which case, apologize with "no preview"
                    let uri;
                    
                    if (rec.httpUri.indexOf('zenodo') > -1) {
                        if (rec.httpUri.indexOf('.svg') > -1) {
                            uri = '/img/kein-preview.png';
                            //fullImage = '/img/kein-preview.png';
                        }
                        else {
                            uri = `${globals.uri.zenodo}/api/iiif/record:${id}:figure.png/full/250,/0/default.jpg`;
                            // fullImage = `${globals.uri.zenodo}/api/iiif/record:${id}:figure.png/full/^1200,/0/default.jpg`;
                        }
                    }

                    // but some are on Pensoft, so use the uri directly
                    else {
                        uri = `${rec.httpUri}/singlefigAOF/`;
                        //fullImage = rec.httpUri;
                    }
                    
                    html += `<figure class="figure-${size}">
                        <picture>
                            <img src="../img/bug.gif" width="${size}" 
                                data-src="${uri}" class="lazyload" data-recid="${id}">
                        </picture>
                        <figcaption>${rec.captionText} <a href="${globals.uri.treatmentBank}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
                    </figure>`;
                }
                else {
                    html += `<a href="${globals.uri.treatmentBank}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
                }

                this._div.innerHTML = html;
            }
        }
        else {
            this._div.innerHTML = initialMsg;
        }

    };

    mapLayers.treatmentInfo = treatmentInfo;
    treatmentInfo.addTo(map);

    const ti = L.DomUtil.get("treatmentInfo");
    //L.DomEvent.addListener(ti, 'change', changeHandler);

    $('body').appendChild($("#treatmentInfo"));
    $("#treatmentInfo").classList.add('treatmentInfo');
}

export { drawTreatments }