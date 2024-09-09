async function drawTreatments(map, treatmentsLayer) {
    const bounds = map.getBounds();
    const treatments = getTreatments(bounds);

    if (!treatmentsLayer) {
        treatmentsLayer = L.markerClusterGroup();
    }

    treatments.forEach((r) => {
        const latlng = new L.LatLng(r.latitude, r.longitude);
        const marker = L.marker(latlng, {icon: O.map.treatmentIcon});

        const tid = r.treatmentId;
        const url = `${globals.server}/treatments?treatmentId=${tid}&cols=httpUri&cols=captionText`;
        const el = document.createElement('div');
        el.classList.add("my-class");
        const html = `<h4 class="popup">${r.treatmentTitle}</h4>`;

        marker.bindPopup(() => {
            O.map.showMarker(url, tid, el, html);
            return el;
        });

        treatmentsLayer.addLayer(marker);
    });

    //map.removeLayer();
    //O.map.addLayerTreatments();
}

/**
 * retrieves treatments within the provided bounds
 */
async function getTreatments(bounds) {
    const min_lat = bounds.getSouthWest().lat;
    const min_lng = bounds.getSouthWest().lng;
    const max_lat = bounds.getNorthEast().lat;
    const max_lng = bounds.getNorthEast().lng;

    const url = `${globals.server}/treatments?location=containedIn({lowerLeft:{lat:${min_lat},lng:${min_lng}},upperRight:{lat:${max_lat},lng:${max_lng}}})&cols=treatmentTitle&cols=latitude&cols=longitude&size=1000`;

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

export { drawTreatments }