import { globals } from './globals.mjs';

const getResource = async (qs) => {
    const sp = new URLSearchParams(qs);

    // save page and size to use later to update the results
    const page = sp.get('page');
    const size = sp.get('size');

    sp.delete('page');
    sp.delete('size');

    const grid = sp.get('grid') || 'normal';
    const figureSize = globals.figureSize[grid];

    // what are we getting, images or treatments?
    const resource = sp.get('resource');

    let haveToGetImagesFromZenodo = true;

    console.log('pre', sp);
    sp.forEach((val, key) => {
        console.log(`key: ${key}, val: ${val}`);
        console.log('now fixing keys');

        // remove invalid Zenodeo keys
        if (globals.validZenodeo.includes(key)) {

            // a qs can look like so
            //
            // `phylogeny&keyword=Plantae`
            //
            // in the above, 'phylogeny' is a key with 
            // no val, so we will use that as 'q'
            //
            if (val) { 
                if (key !== 'q') {
                    console.log('zenodoFying')
                    haveToGetImagesFromZenodo = false;
                }
            }

            // We haveToGetImagesFromZenodo only if 
            // no other key besides 'q' is used. If any 
            // key other than 'q' is used then we 
            // set haveToGetImagesFromZenodo to false
            else {
                console.log('q-ifying')
                sp.set('q', key); 
                sp.delete(key);
            }
        }
        else {
            console.log(`delieting ${key}`)
            sp.delete(key);
        }
    });

    console.log('post', sp);
}

const qs = 'page=1&size=30&resource=images&class=Arachnida';
getResource(qs);