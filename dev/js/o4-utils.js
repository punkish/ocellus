'use strict';

if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

O.niceNumbers = function(n) {
    return n > 9 ? n : ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][n];
};

O.renderResults = function(result) {

    const resource = result.resource;

    // the result panel where the results are shown
    const rp = document.querySelector(`#${resource} div.result`);
    const tl = document.querySelector(`#template-${resource}`).innerHTML;
    const tp = {
        'template-pager': document.querySelector('#template-pager').innerHTML,
        'template-records-found': document.querySelector('#template-records-found').innerHTML,
        'template-kein-preview': document.querySelector('#template-kein-preview').innerHTML
    };

    rp.innerHTML = Mustache.render(tl, result, tp);

    const fc = document.querySelectorAll('figcaption > a');
    for (let i = 0, j = fc.length; i < j; i++) {
        fc[i].addEventListener('click', O.toggleFigcaption);
    }

    return result.resource;
};

O.getResource = function(event) {

    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const f = document.querySelector('#searcher');
    const fe = f.elements;

    // don't go further if search field is empty
    const q = f.querySelector('input[name=q]');
    if (q.value === '') {
        q.placeholder = 'c‘mon, enter something';
        q.classList.remove('nudge');
        q.classList.add('warning');
        q.focus();
        return false;
    }
    else {
        q.classList.remove('warning');
        q.classList.add('nudge');
    }

    // we will collect all the form inputs in 'inputs'
    const inputs = {};
    for (let i = 0, j = fe.length; i < j; i++) {
        const inp = f[i];
        if (inp.name) {
            const n = inp.name;
            const v = inp.value;
            const t = inp.type;
            const c = inp.checked;

            if (t === 'checkbox') {
                if (c) {
                    if (n in inputs) {
                        inputs[n].push(v);
                    }
                    else {
                        inputs[n] = [v];
                    }
                }
            }
            else if (t === 'radio') {
                if (c) {
                    inputs[n] = v;
                }
            }
            else {
                inputs[n] = v;
            }
        }
    }
        
    O.getFoo({
        resource: document.querySelector('input[name=resource]:checked').value,
        inputs: inputs,
        cb: O.renderResults
    });
    
};

O.noThrob = function(resource) {

    // first, hide all modals and resources
    const modals = document.querySelectorAll('main section');
    for (let i = 0, j = modals.length; i < j; i++) {
        const id = modals[i].id;
        if (id !== resource) {
            O.hide(id);
        }
    }

    const t = document.querySelector('#throbber');
    t.classList.add('nothrob');
};

O.getFoo = function(obj) {

    const {resource, inputs, cb} = obj;
    const {z, b} = O.inputs2uris(inputs, resource);

    O.logger('getFoo()', `getting ${resource}`);
    log.info(`zenodeoUri: ${z}`);
    log.info(`browserUri: ${b}`);

    // activate the throbber
    const t = document.querySelector('#throbber');
    t.classList.remove('nothrob');

    // inputs will exist if getFoo() has been called from getResource(),
    // that is, a resource is being queried for either via the form
    // or by loading a URL with search params
    let sct;
    if (inputs) {

        // add the search criteria text to the resource page
        sct = inputs ? O.formatSearchCriteria(inputs) : '';
        O.waitMessage(resource, sct);

        // set the browser URL and show the resource page with the 
        // "Looking for…" message
        history.pushState(null, null, b);
        O.show(resource);
    }

    const _makeLayout = function(resource, records) {

        let figures = [];
    
        if (resource === 'treatments') {
            for (let i = 0, j = records.length; i < j; i++) {
                const r = records[i];
                figures.push(r)
            }
        }
        else if (resource === 'images') {
            for (let i = 0, j = records.length; i < j; i++) {
                const r = records[i];
                
                figures.push({
                    title       : r.metadata.title,
                    creators    : r.metadata.creators ? r.metadata.creators.map(c => c.name) : [],
                    recId       : r.id,
                    zenodoRecord: O.zenodoUri + r.id,
                    description : r.metadata.description,
                    doi         : r.doi,
                    img         : r.links.thumbs ? true : false,
                    img10       : r.links.thumbs ? r.links.thumbs['10']   : '',
                    img50       : r.links.thumbs ? r.links.thumbs['50']   : '',
                    img100      : r.links.thumbs ? r.links.thumbs['100']  : '',
                    img250      : r.links.thumbs ? r.links.thumbs['250']  : '',
                    img750      : r.links.thumbs ? r.links.thumbs['750']  : '',
                    img1200     : r.links.thumbs ? r.links.thumbs['1200'] : ''
                })
            }
        }
        else if (resource === 'citations') {
        }

        return figures;
    };

    // now fetch the records and process the result
    fetch(z)
        .then(O.fetchReceive)
        .then(function(res) {

            const recs = res['num-of-records'];

            const result = {
                resource: resource,
                'num-of-records': recs
            };

            if (inputs) {
                
                const limit = 30;

                result.successful = true;
                result['search-criteria-text'] = sct;
                
                // make pager and layout ///////////////////////////////////////
                if (recs) {

                    result.shown = recs == 1 ? 'It is shown below' : `${O.niceNumbers(res.from)} to ${O.niceNumbers(res.to)} are shown below`;                    
                    result.figures = _makeLayout(resource, res.records);
                    result.niceNumbers = O.niceNumbers(recs);

                    if (recs >= limit) {
                        result.prev = b.replace(/page=\d+/, `page=${res.prevpage}`);
                        result.next = b.replace(/page=\d+/, `page=${res.nextpage}`);
                        result.pager = true;
                    }
                    
                }
                else {
                    result.pager = false;
                    result.figures = [];
                }
                ////////////////////////////////////////////////////////////////

            }

            return result;

        })
        .then(cb)
        .then(O.noThrob);
    
};