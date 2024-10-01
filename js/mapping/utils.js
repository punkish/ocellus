function addLayer(map, layer) {
    if (!map.hasLayer(layer)) {
        map.addLayer(layer);
    }
}

function removeLayer(map, mapLayers, layerName) {
    console.log(`removing layer ${layerName}`);
    console.log(mapLayers)

    if (layerName in mapLayers) {
        if (map.hasLayer(mapLayers[layerName])) {
            map.removeLayer(mapLayers[layerName]);
        }
    }
    
}

export {
    addLayer,
    removeLayer
}