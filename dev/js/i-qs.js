'use strict'

// queryString from the browser bar (q, page, size)
const getQsFromBrowser = () => {
    const loc = new URL(location);
    const search = loc.search;
    const sp = new URLSearchParams(search);

    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');
    
}

// queryString that is sent to zenodeo (q, page, size, refreshCache, extra)
// q value as entered by the user (q)
// form inputs (q, page, size, refreshCache)
// queryString from the form inputs (q, page, size, refreshCache)

// convert form inputs to queryString
const inputs2qs = (inputs) => {
    const sp = new URLSearchParams();

    inputs.forEach(i => {
        if (i.id === 'q') {
            const sp_tmp = new URLSearchParams(i.value);
            sp_tmp.forEach((val, key) => {
                if (val === '') {
                    sp.append('q', key);
                }
                else {
                    sp.append(key, val);
                }
            })
        }
        else {
            if (i.id === 'refreshCache') {
                if (i.checked) {
                    sp.append('refreshCache', true);
                }
            }
            else {
                sp.append(i.id, i.value);
            }
        }
    })

    return sp.toString();
}

// convert queryString to form inputs
const qs2inputs = (qs) => {
    const inputs = {};
    const sp = new URLSearchParams(qs);

    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');

    const notq = ['page', 'size'];

    let q = [];
    sp.forEach((val, key) => {
        if (notq.includes(key)) {
            inputs[key] = val;
        }
        else {
            const cue = key === 'q' ? val : `${key}=${val}`;
            q.push(cue);
        }
    });

    inputs.q = q.join('&');

    return inputs;
}

const form2obj = () => {
    const obj = {};
    $$('form input').forEach(i => {
        if (i.id === 'refreshCache') {
            obj[i.id] = i.checked ? true : false;
        }
        else {
            obj[i.id] = i.value;
        }
    })

    return obj;
}



const inputs = {
    page: 1,
    size: 30,
    refreshCache: true,
    q: 'agosti&publicationDate=since(2010-12-01)&checkinTime=between(2015-01-01 and 2016-12-12)'
}

const qs = inputs2qs(inputs);
console.log(qs);
const inputs2 = qs2inputs(qs);
console.log(inputs2);