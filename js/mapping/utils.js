function addLayer(map, layer) {
    if (!map.hasLayer(layer)) {
        map.addLayer(layer);
    }
}

function removeLayer(map, layer) {
    if (map.hasLayer(layer)) {
        map.removeLayer(layer);
    }
}

export {
    addLayer,
    removeLayer
}