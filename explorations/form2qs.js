const strings = {
    s0: 'Temperate Grasses',
    s1: 'Temperate Grasses & Shrubs',
    s3: 'biome=Temperate Grasses & Shrubs&region=grasses'
}

const r = / & /g;

for (let [str, val] of Object.entries(strings)) {
    
    val = val.replaceAll(r, '%20%26%20');
    const p = new URLSearchParams(val);
    console.log(p)
    // if (val.indexOf('=') > -1) {
    //     //const sp = new URLSearchParams(encodeURI(val));
    //     console.log(encodeURI(val))
    // }
}