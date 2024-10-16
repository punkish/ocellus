function getMapLocation({ zoom, lat, lng, treatmentId }) {
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    zoom = parseInt(parsedHash.get("zoom"), 10) ?? zoom;
    lat = parseFloat(parsedHash.get("lat")) ?? lat;
    lng = parseFloat(parsedHash.get("lng")) ?? lng;
    treatmentId = parsedHash.get("treatmentId") ?? treatmentId;
    
    return { zoom, lat, lng, treatmentId };
}

function setupMap(map) {
    let shouldUpdate = true;

    const updatePermalink = function() {

        if (!shouldUpdate) {

            // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
            shouldUpdate = true;
            return;
        }

        const center = map.getCenter();
        const lat = Math.round(center.lat * 100000) / 100000;
        const lng = Math.round(center.lng * 100000) / 100000;
        const zoom = map.getZoom();

        let hash = `#show=maps&lat=${lat}&lng=${lng}&zoom=${zoom}`;

        const parsedHash = new URLSearchParams(window.location.hash.substring(1));
        const treatmentId = parsedHash.get("treatmentId") ?? treatmentId;

        if (treatmentId) {
            hash += `&treatmentId=${treatmentId}`;
        }


        const state = {
            zoom,
            center: { lat, lng }
        };
        window.history.pushState(state, 'map', hash);
    };

    map.on('moveend', updatePermalink);

    // restore the view state when navigating through the history, see
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
    window.addEventListener('popstate', function (event) {

        if (event.state === null) {
            return;
        }

        map.setView(event.state.center, event.state.zoom);
        shouldUpdate = false;
    });
}

export { getMapLocation, setupMap }