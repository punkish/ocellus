import { globals } from "../globals.js";
import { Slidebar } from "../../libs/leaflet-slidebar/src/leaflet.slidebar.js";

/**
 * retrieves treatments within the provided bounds
 */
async function getImages(bounds) {
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

async function foo(map, mapLayers) {
    const bounds = map.getBounds();
    const images = await getImages(bounds);

    if (!mapLayers.imageMarkerClusters) {
        mapLayers.imageMarkerClusters = L.markerClusterGroup({ 
            disableClusteringAtZoom: 10 
        });
    }
    
    const clickedMarkers = [];

    images.forEach((image) => {
        const images_id = image.images_id;
        
        // We add a marker for the image if the imageMarkers Map() doesn't 
        // already have it
        if (!mapLayers.imageMarkers.has(images_id)) {
            const treatmentId = image.treatmentId;
            const markerOpts = { 
                title: treatmentId,
                icon:  globals.markerIcons.default
            };

            const latlng = new L.LatLng(image.latitude, image.longitude);
            const marker = L.marker(latlng, markerOpts);
        
            marker.on('click', async function (e) {
                const thisMarker = e.target;
                thisMarker.setIcon(globals.markerIcons.active);
                const content = await getImageInfo(image);
                mapLayers.slidebar.update({ content, latlng });
                const lsb = document.querySelector('#leaflet-slidebar');
                lsb.style.visibility = 'visible';
                updatePermalink(map, treatmentId, images_id);
                //mapLayers.imageMarkerClusters.zoomToShowLayer(thisMarker);
                const cluster = mapLayers.imageMarkerClusters
                    .getVisibleParent(thisMarker);

                // if (cluster) {
                //     console.log(`marker is part of a cluster`);
                //     console.log(cluster)
                //     mapLayers.imageMarkerClusters.spiderfy(cluster);
                // }
                
                
                //const lastKey = [...mapLayers.markers.keys()].pop();
                
                // if (lastKey) {
                //     const lastClicked = mapLayers.markers.get(lastKey);
                //     console.log(`setting icon of ${lastKey} to 'clicked'`);
                //     lastClicked.marker.setIcon(globals.markerIcons.clicked);
                //     lastClicked.status = 'clicked';
                // }

                const lastClickedMarker = clickedMarkers[ 
                    clickedMarkers.length - 1
                ];

                if (lastClickedMarker) {
                    lastClickedMarker.setIcon(globals.markerIcons.clicked);
                }

                clickedMarkers.push(thisMarker);
                
            });
    
            // Store the marker in the markers Map() 
            mapLayers.imageMarkers.set(images_id, marker);

            // Add the marker to the imageMarkerClusters layer
            mapLayers.imageMarkerClusters.addLayer(marker);
        }
        
    });
    
    // Add the imageMarkerClusters layer to the map
    if (!map.hasLayer(mapLayers.imageMarkerClusters)) {
        map.addLayer(mapLayers.imageMarkerClusters);
    }
    
}

async function drawImageMarkers(map, mapLayers) {
    
    if ('h3' in mapLayers) {

        if (map.hasLayer(mapLayers.h3)) {
            log.info('removing h3 layer')
            map.removeLayer(mapLayers.h3);
            mapLayers.h3info.remove();
        }

    }

    if ('imageMarkerClusters' in mapLayers) {
        log.info('re-adding existing image marker clusters');
        await foo(map, mapLayers);
        mapLayers.slidebar.addTo(map);
    }
    else {
        log.info('initializing image marker clusters')
        makeSlidebar(map, mapLayers);

        // We store the markers as we draw them
        mapLayers.imageMarkers = new Map();
        await foo(map, mapLayers);
    }

    // if (treatmentId) {
    //     const [ treatments_id, images_id ] = treatmentId.split('-');

        
    //     const marker = mapLayers.imageMarkers.has(treatmentId);

    //     if (marker) {
    //         mapLayers.imageMarkerClusters.zoomToShowLayer(marker);
    //         marker.fireEvent('click');
    //     }
        
    // }
}

function updatePermalink(map, treatmentId, images_id) {

    // if (!shouldUpdate) {

    //     // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
    //     shouldUpdate = true;
    //     return;
    // }

    const center = map.getCenter();
    const lat = Math.round(center.lat * 100000) / 100000;
    const lng = Math.round(center.lng * 100000) / 100000;
    const zoom = map.getZoom();

    let hash = `#show=maps&lat=${lat}&lng=${lng}&zoom=${zoom}&treatmentId=${treatmentId}-${images_id}`;

    const state = {
        zoom,
        center: { lat, lng }
    };
    window.history.pushState(state, 'map', hash);
}

function makeSlidebar(map, mapLayers) {

    // create the sidebar instance and add it to the map
    mapLayers.slidebar = new Slidebar({
        //content: '<i>Click on a marker for more info</i>',
        state: 'closed'
    });

    mapLayers.slidebar.addTo(map); 
}

async function getImageInfo (image) {

    if (image) {
        const treatmentId = image.treatmentId;
        //const url = `${globals.uri.zenodeo}/images?treatmentId=${treatmentId}&cols=httpUri&cols=caption`;
        const url = `${globals.uri.zenodeo}/images?id=${image.images_id}&cols=httpUri&cols=caption`;
        let content = `<h3>${image.treatmentTitle}</h3>`;
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
                
                content += `
                <figure class="figure-${size}">
                    <img src="../img/bug.gif" width="${size}" data-src="${uri}" 
                        class="lazyload" data-recid="${id}">
                    <figcaption>${rec.captionText} <a href="${globals.uri.treatmentBank}/treatments?treatmentId=${treatmentId}" target="_blank">more on TB</a></figcaption>
                </figure>`;
            }
            else {
                content += `<a href="${globals.uri.treatmentBank}/treatments?treatmentId=${treatmentId}" target="_blank">more on TB</a>`;
            }

            return content;
        }
    }
    else {
        return 'Click on an image marker for more info';
    }
}

export { drawImageMarkers }