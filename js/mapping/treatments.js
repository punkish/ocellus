import { globals } from "../globals.js";
import { Slidebar } from "../../libs/leaflet-slidebar/src/leaflet.slidebar.js";

/**
 * retrieves treatments within the provided bounds
 */
async function getTreatments(bounds) {
    const min_lat = bounds.getSouthWest().lat;
    const min_lng = bounds.getSouthWest().lng;
    const max_lat = bounds.getNorthEast().lat;
    const max_lng = bounds.getNorthEast().lng;

    const url = `${globals.uri.zenodeo}/images?geolocation=within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})&cols=treatmentId&cols=treatmentTitle&cols=latitude&cols=longitude&size=5000`;
    const response = await fetch(url, globals.fetchOpts);
    
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
    log.info('drawing treatments')
    
    if ('h3' in mapLayers) {
        map.removeLayer(mapLayers.h3);
        mapLayers.h3info.remove();
    }

    //const screenSize = getScreenSize();

    if ('treatments' in mapLayers) {
        map.addLayer(mapLayers.treatments);
        mapLayers.slidebar.addTo(map);
    }
    else {
        makeSlidebar(map, mapLayers);
        const bounds = map.getBounds();
        const treatments = await getTreatments(bounds);
        mapLayers.treatments = L.markerClusterGroup({
            disableClusteringAtZoom: 10
        });

        const clickedMarkers = [];
        const iconDefault = L.icon(globals.markerIcons.default);
        const iconActive  = L.icon(globals.markerIcons.active);
        const iconClicked = L.icon(globals.markerIcons.clicked);

        treatments.forEach((treatment) => {
            const latlng = new L.LatLng(
                treatment.latitude, 
                treatment.longitude
            );
            const marker = L.marker(
                latlng, 
                { 
                    title: treatment.treatmentId,
                    icon:  iconDefault
                }
            );
            
            marker.on('click', async function (e) {
                const thisMarker = e.target;
                thisMarker.setIcon(iconActive);
                const lastClicked = clickedMarkers[ clickedMarkers.length - 1 ];
                const content = await getTreatmentInfo(treatment);
                mapLayers.slidebar.update({ 
                    content, 
                    coords: latlng 
                });
                clickedMarkers.push(thisMarker);

                if (lastClicked) {
                    lastClicked.setIcon(iconClicked);
                }
            });

            mapLayers.markers[treatment.treatmentId] = marker;
            mapLayers.treatments.addLayer(marker);
        });
        
        map.addLayer(mapLayers.treatments);
    }

}

function makeSlidebar(map, mapLayers) {

    // create the sidebar instance and add it to the map
    mapLayers.slidebar = new Slidebar({
        //content: '<i>Click on a marker for more info</i>',
        state: 'closed'
    });

    mapLayers.slidebar.addTo(map); 
}

async function getTreatmentInfo (treatment) {

    if (treatment) {
        const tid = treatment.treatmentId;
        const url = `${globals.uri.zenodeo}/images?treatmentId=${tid}&cols=httpUri&cols=caption`;
        let html = `<h3>${treatment.treatmentTitle}</h3>`;
        const response = await fetch(url, globals.fetchOpts);

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
                
                html += `
                <figure class="figure-${size}">
                    <img src="../img/bug.gif" width="${size}" 
                            data-src="${uri}" class="lazyload" 
                            data-recid="${id}">
                    <figcaption>${rec.captionText} <a href="${globals.uri.treatmentBank}/treatments?treatmentId=${tid}" target="_blank">more on TB</a></figcaption>
                </figure>`;
            }
            else {
                html += `<a href="${globals.uri.treatmentBank}/treatments?treatmentId=${tid}" target="_blank">more on TB</a>`;
            }

            return html;
        }
    }
    else {
        return 'Click on a treatment for more info';
    }
}

export { drawTreatments }