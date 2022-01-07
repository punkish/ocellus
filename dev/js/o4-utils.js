if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

'use strict'

O.utils = {

    niceNumbers: function(n) {
        return n > 9 ? n : ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][n];
    },

    renderResults: function(result) {
        const resource = result.resource;
        const template = result.template;

        // the result panel where the results are shown
        const rp = document.querySelector(`#${resource} div.result`);
        const tl = document.querySelector(`#template-${template}`).innerHTML;
        const tp = {
            'template-pager': document.querySelector('#template-pager').innerHTML,
            'template-records-found': document.querySelector('#template-records-found').innerHTML,
            'template-kein-preview': document.querySelector('#template-kein-preview').innerHTML
        };

        rp.innerHTML = Mustache.render(tl, result, tp);

        const fc = document.querySelectorAll('figcaption > a');
        for (let i = 0, j = fc.length; i < j; i++) {
            fc[i].addEventListener('click', O.base.toggleFigcaption);
        }

        return result.resource;
    },

    prepareQuery: function(event) {
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
            
        O.utils.getResource({
            resource: document.querySelector('input[name=resource]:checked').value,
            inputs: inputs,
            cb: O.utils.renderResults
        });
        
    },

    noThrob: function(resource) {

        // first, hide all modals and resources
        const modals = document.querySelectorAll('main section');
        for (let i = 0, j = modals.length; i < j; i++) {
            const id = modals[i].id;
            if (id !== resource) {
                O.base.hide(id);
            }
        }

        const t = document.querySelector('#throbber');
        t.classList.add('nothrob');
    },

    getResource: function(obj) {

        const {resource, inputs, cb} = obj;
        const {z, b} = O.utils.inputs2uris(inputs, resource);

        O.base.logger('getResource()', `getting ${resource}`);
        log.info(`zenodeoUri: ${z}`);
        log.info(`browserUri: ${b}`);

        // activate the throbber
        const t = document.querySelector('#throbber');
        t.classList.remove('nothrob');

        // inputs will exist if getResource() has been called from prepareQuery(),
        // that is, a resource is being queried for either via the form
        // or by loading a URL with search params
        let searchCriteria;
        if (inputs) {

            // add the search criteria text to the resource page
            searchCriteria = inputs ? O.base.formatSearchCriteria(inputs) : '';
            O.utils.waitMessage(resource, searchCriteria);

            // set the browser URL and show the resource page with the 
            // "Looking for…" message
            history.pushState(null, null, b);
            O.base.show(resource);
        }

        const _makeLayout = function(resource, records) {

            let figures = [];
        
            if (resource === 'treatments') {
                for (let i = 0, j = records.length; i < j; i++) {
                    const r = records[i];
                    r.recId = r.treatmentId;
                    figures.push(r);
                }
            }

            else if (resource === 'images') {
                for (let i = 0, j = records.length; i < j; i++) {
                    const r = records[i];
                    
                    figures.push({
                        title       : r.metadata.title,
                        creators    : r.metadata.creators ? r.metadata.creators.map(c => c.name) : [],
                        recId       : r.id,
                        zenodoRecord: `${G.zenodoUri}/${r.id}`,
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
                for (let i = 0, j = records.length; i < j; i++) {
                    const r = records[i];
                    r.recId = r.bibRefCitationId;
                    figures.push(r);
                }
            }

            return figures;
        };

        try {

            // now fetch the records and process the result
            fetch(z)
                .then(O.base.fetchReceive)
                .then(function(data) {
                    const res = data.item.result;

                    const result = {
                        resource,
                        'num-of-records': res.count
                    };

                    
                    if (inputs) {
                        result['search-criteria-text'] = searchCriteria;

                        if (inputs.q.length === 32) {
                            if (res['search-criteria'].resource === 'treatments') {
                                result.template = 'treatment';
                            }
                            else if (res['search-criteria'].resource === 'citations') {
                                result.template = 'citation';
                            }

                            if (res.count) {
                                result.figures = res.records[0];
                            }
                        }
                        else {
                            result.template = result.resource;
                            
                            result.niceNumbers = O.utils.niceNumbers(res.count);

                            if (res.count) {
                                result.successful = true;

                                if (res.count == 1) {
                                    result.shown = 'it is shown below';
                                }
                                else if (res.count > 1 && res.count <= G.pageSize) {
                                    result.shown = `one to ${result.niceNumbers} are shown below`;
                                }
                                else {
                                    const from = O.utils.niceNumbers(((inputs['$page'] - 1) * G.pageSize) + 1);
                                    const to = O.utils.niceNumbers(inputs['$page'] * G.pageSize);
                                    result.shown = `${from} to ${to} are shown below`;
                                }
                                                
                                result.figures = _makeLayout(resource, res.records);

                                if (res.count >= G.pageSize) {
                                    const _prev = new URL(data.item._links._prev);
                                    const _next = new URL(data.item._links._next);

                                    result.prev = _prev.search;
                                    result.next = _next.search;
                                    result.pager = true;
                                }
                            }
                            else {
                                result.successful = false;
                                result.shown = '';
                                result.pager = false;
                                result.figures = [];
                            }
                        }
                    }

                    return result;
                })
                .then(cb)
                .then(O.utils.noThrob);
        }
        catch (error) {
            log.error(error);
        }
        
    },

    waitMessage: function(resource, searchcriteria) {
        const rp = document.querySelector(`#${resource}`);
        O.base.show(resource);
        const rf = rp.querySelector('.result');
        rf.innerHTML = `<p id="records-found" class="records-found">Looking for ${resource} where ${searchcriteria}</p>`;
    },

    inputs2uris: function(inputs, resource) {
        const zparams = [];
        const bparams = [];

        for (const key in inputs) {

            if (G.zenodeoUriParams[resource].includes(key)) {
                if (key === 'q') {
                    if (key.length == 32) {
                        if (resource === 'treaments') {
                            zparams.push(`treatmentId=${inputs[key]}`);
                        }
                        else if (resource === 'citations') {
                            zparams.push(`bibRefCitationId=${inputs[key]}`);
                        }
                    }
                    else {
                        zparams.push(`q=${inputs[key]}`);
                    }
                }
                else {
                    zparams.push(`${key}=${inputs[key]}`);
                }
            }

            if (G.browserUriParams[resource].includes(key)) {
                bparams.push(`${key}=${inputs[key]}`);
            }
            
        }

        const zs = zparams.length ? `?${zparams.sort().join('&')}` : '';
        const z = `${G.zenodeoUri}/${resource}${zs}`;

        const bs = bparams.length ? `?${bparams.join('&')}` : '';
        const b = `${resource}.html${bs}`;
        return {z, b};
    }
}