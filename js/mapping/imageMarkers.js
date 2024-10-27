import { $ } from "../base.js";
import { globals } from "../globals.js";
import { Slidebar } from "../../libs/leaflet-slidebar/src/leaflet.slidebar.js";
import { makeImage, makeTreatment } from "../render-figures.js";
/**
 * retrieves treatments within the provided bounds
 */
async function getImages(bounds) {
    const min_lat = bounds.getSouthWest().lat;
    const min_lng = bounds.getSouthWest().lng;
    const max_lat = bounds.getNorthEast().lat;
    const max_lng = bounds.getNorthEast().lng;

    const url = `${globals.uri.zenodeo}/images?geolocation=within(min_lat:${min_lat},min_lng:${min_lng},max_lat:${max_lat},max_lng:${max_lng})&cols=treatmentId&cols=latitude&cols=longitude&size=5000`;
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

async function makeImageMarkers(map, mapLayers) {
    const throbber = $('#throbber');
    throbber.classList.remove('nothrob');
    const bounds = map.getBounds();
    const images = await getImages(bounds);

    if (images) {

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
                    throbber.classList.remove('nothrob');
                    const thisMarker = e.target;
                    thisMarker.setIcon(globals.markerIcons.active);
                    const content = await getImageInfo(image);
                    mapLayers.slidebar.update({ content, latlng });
                    throbber.classList.add('nothrob');
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
            log.info('re-adding existing image marker clusters');
            map.addLayer(mapLayers.imageMarkerClusters);
        }
        else {
            log.info('used existing image marker clusters layer');
        }

        
    }

    throbber.classList.add('nothrob');
    
}

async function drawImageMarkers(map, mapLayers, treatmentId) {
    
    if ('h3' in mapLayers) {

        if (map.hasLayer(mapLayers.h3)) {
            log.info('removing h3 layer')
            map.removeLayer(mapLayers.h3);
            mapLayers.h3info.remove();
        }

    }

    if ('imageMarkerClusters' in mapLayers) {
        await makeImageMarkers(map, mapLayers);
        mapLayers.slidebar.addTo(map);
    }
    else {
        log.info('initializing image marker clusters')
        makeSlidebar(map, mapLayers);

        // We store the markers as we draw them
        mapLayers.imageMarkers = new Map();
        await makeImageMarkers(map, mapLayers);
    }

    if (treatmentId) {
        const [ treatments_id, images_id ] = treatmentId.split('-');

        const marker = mapLayers.imageMarkers.get(Number(images_id));

        if (marker) {
            mapLayers.imageMarkerClusters.zoomToShowLayer(marker);
            marker.fireEvent('click');
        }
        
    }
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
        const url = `${globals.uri.zenodeo}/images?id=${image.images_id}&cols=treatmentId&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=caption`;

        const response = await fetch(url, globals.fetchOpts);

        if (response.ok) {
            const res = await response.json();
            const r = res.item.result.records[0];
            const record = {
                zenodoDep: r.zenodoDep,
                treatmentId: r.treatmentId,
                treatmentTitle: r.treatmentTitle,
                captionText: r.captionText,
                loc: undefined,
                convexHull: undefined
            };

            const id = r.httpUri.split('/')[4];

            // if the figure is on zenodo, show their thumbnails unless 
            // it is an svg, in which case, apologize with "no preview"
            if (r.httpUri.indexOf('zenodo') > -1) {
                if (r.httpUri.indexOf('.svg') > -1) {
                    record.uri = '/img/kein-preview.png';
                    record.fullImage = '/img/kein-preview.png';
                }
                else {
                    record.uri = `https://zenodo.org/api/iiif/record:${id}:figure.png/full/250,/0/default.jpg`;

                    record.fullImage = `https://zenodo.org/api/iiif/record:${id}:figure.png/full/^1200,/0/default.jpg`;
                    record.fullImg = `${globals.zenodoUri}/${id}/thumb1200`;
                }
            }

            // but some are on Pensoft, so use the uri directly
            else {
                record.uri = `${r.httpUri}/singlefigAOF/`;
                record.fullImage = r.httpUri;
            }
            

            const content = makeImage({ figureSize: 250, rec: record, target: 'slidebar' });

            return content;
        }
    }
    else {
        return 'Click on an image marker for more info';
    }
}

export { drawImageMarkers }