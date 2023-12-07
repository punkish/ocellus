const stringsObj = {
    s0: 'Temperate Grasses',
    s1: 'Temperate Grasses & Shrubs',
    s3: 'biome=Temperate Grasses & Shrubs&region=grasses',
    s4: 'decapoda&journalTitle=not_like(zootaxa)'
}


function form2qs(stringsObj) {
    

    for (const [strName, str] of Object.entries(stringsObj)) {
        _form2qs(str);
    }

    
}

function _form2qs(str) {
    const sp = new URLSearchParams();

    // see discussion at
    // https://stackoverflow.com/q/77613064/183692
    const ampEncoded = str.replaceAll(/ & /g, '%20%26%20');
    const spTmp = new URLSearchParams(ampEncoded);

    let key = 'q';
    let val = str;

    spTmp.forEach((v, k) => {
        if (v === '') {

            // check if the input looks like a DOI
            const match = val.match(/(^10\.[0-9]{4,}.*)/);
            if (match && match[1]) {
                key = 'articleDOI';
                val = match[1];
            }
            else {
                key = 'q';
                val = k;
            }
            
        }
        else {
            key = k;
            val = v;
        }

        sp.append(key, val);
    });

    console.log(sp);
}

form2qs(stringsObj);