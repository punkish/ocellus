if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

'use strict';

O.base = {

    /*
     * A place to cache the total number of images, treatments, 
     * and citations, usually on page load. This way the db 
     * doesn't have to be queried everytime the user changes 
     * the resource being searched
    */
    'num-of-records': {
        images: 0,
        treatments: 0,
        citations: 0
    },

    logger: function(fn, msg) {
        const line = '-'.repeat(50);
        log.info(line);
        log.info(`${fn}: ${msg}`);
        log.info(line);
    },

    init: function() {
        log.level = log[G.loglevel];
        log.info(`the log level is ${G.loglevel}`);

        // add click events to modal togglers and modal close links
        O.base.addEventHandlers([
            { 
                selectors: document.querySelectorAll('.modal-open'), 
                action: 'click', 
                handler: { name: 'openModal()', fn: O.openModal } 
            },
            { 
                selectors: document.querySelectorAll('.modal-close'), 
                action: 'click', 
                handler: { name: 'closeModal()', fn: O.closeModal } 
            }
        ]);

        // when page loads, try to determine the requested resource
        // from the URI. The resouce will default to 'index'
        const {hash, resource, search} = O.base.resourceFromUrl(location);

        if (O.closedForMaintenance) {
            if (G.pseudoResources.includes(resource)) {
                O.base.show(resource);
            }
            else {
                O.base.show('closedForMaintenance');
            }
        }
        else {

            O.base.addEventHandlers([
                { 
                    selectors: [ document.querySelector('#searcher') ], 
                    action: 'submit', 
                    handler: { name: 'prepareQuery()', fn: O.utils.prepareQuery } 
                },
                { 
                    selectors: [ document.querySelector('input[name=submit]') ], 
                    action: 'click', 
                    handler: { name: 'prepareQuery()', fn: O.utils.prepareQuery } 
                },
                {
                    selectors: document.querySelectorAll('input[name=resource]'), 
                    action: 'click', 
                    handler: { name: 'selectResource()', fn: O.base.selectResource } 
                },
                { 
                    selectors: [
                        document.querySelector('input[name="refreshCache"]'), 
                        document.querySelector('input[name=communitiesChooser]')
                    ],
                    action: 'click', 
                    handler: { name: 'toggler()', fn: O.base.toggler }
                }
            ]);

            if (G.pseudoResources.includes(resource)) {
                O.base.show(resource);
            }
            else {
                O.base.show('searcher');

                O.base.logger('init()', 'initializing autocomplete');
                new autoComplete({
                    selector: document.querySelector('input[name=q]'),
                    minChars: 3,
                    source: async function(term, suggest) {
                        try { fetch.abort() } catch(e) {}

                        let response = await fetch(`${G.zenodeoUri}/families?q=${term}`);

                        // if HTTP-status is 200-299
                        // get the response body (the method explained below)
                        if (response.ok) { 
                            const data = await response.json();
                            if (data.item.result.count) {
                                const families = data.item.result.records.map(r => r.family);
                                suggest(families);
                            }
                        } 
                        else {
                            alert("HTTP-Error: " + response.status);
                        }
                    }
                });

                log.info(`- getting ${resource}`);
                if (resource === 'index') {
                    log.info(`- getting selected resource`);
                    O.base.updatePlaceholder(document.querySelector('input[name=resource]:checked').value);
                    O.base.show('index');                
                }
                else if (G.resources.includes(resource)) {
                    
                    if (search) {
                        log.info(`- getting search`);
                        O.base.fillSearchForm(search, resource);
                    }
                    else {
                        log.info(`- getting ${resource}`);
                        O.base._selectResource(resource);
                        O.base.updatePlaceholder(resource);
                        O.base.show(resource);
                    }
                }
            }
        }
    },

    // add event listeners to various elements that toggle
    // visibility of other elements, or submit form
    addEventHandlers: function(eventHandlers) {

        O.base.logger('addEventHandlers()', 'adding event handlers');

        for (let i = 0, j = eventHandlers.length; i < j; i++) {
            const {selectors, action, handler} = eventHandlers[i];
            
            for (let i = 0, j = selectors.length; i < j; i++) {
                const el = selectors[i];
                const id = el.name || el.id || `${el.nodeName}.${el.pathname.split('/').pop()}`;
                    
                log.info(`- added ${handler.name} to ${id}`);
                el.addEventListener(action, handler.fn);
            }

        }
        
    },

    toggler: function(event) {
        const target_id = event.target.name;
        const t = document.getElementById(`${target_id}`);

        if (t.classList.contains('hidden-none')) {
            t.classList.add('visible-block');
            t.classList.remove('hidden-none');
        }
        else if (t.classList.contains('hidden-block')) {
            t.classList.add('visible-block');
            t.classList.remove('hidden-block');
        }
        else if (t.classList.contains('visible-block')) {
            t.classList.add('hidden-block');
            t.classList.remove('visible-block');
        }
    },

    openModal: function(event) {

        // first, hide all modals and resources
        const modals = document.querySelectorAll('main section');
        for (let i = 0, j = modals.length; i < j; i++) {
            O.base.hide(modals[i].id);
        }

        const href = event.target.href;
        const modal = href.split('/').pop().split('.').shift();

        // now show the requested element and change the browser url
        const url = `${modal}.html`;
        history.pushState(null, null, url);

        O.base.show(modal);

        event.stopPropagation();
        event.preventDefault();
    },

    // handler attached to 'close' links in the modals
    closeModal: function(event) {
        let modal = event.target.parentElement.id;

        // Note: all modals have display property 'none'
        O.base.hide(modal);

        if (O.closedForMaintenance) {
            modal = 'closedForMaintenance';
        }
        else {
            modal = 'index';
            O.base.show('searcher');
        }

        // now show the requested element and change the browser url
        const url = O.closedForMaintenance ? 'index.html' : `${modal}.html`;
        history.pushState(null, null, url);
        O.base.show(modal);
        
        event.stopPropagation();
        event.preventDefault();
    },

    // show
    show: function(id) {
        log.info(`showing ${id}`);
        const el = document.querySelector(`#${id}`);
        el.classList.add('visible-block');
        el.classList.remove('hidden-none');    
    },

    // hide
    hide: function(id) {
        log.info(`hiding ${id}`);
        const el = document.querySelector(`#${id}`);
        el.classList.add('hidden-none');
        el.classList.remove('visible-block');
    },

    // format the text for the search criteria using the input values
    formatSearchCriteria: function(s) {
        const criteria = [];
        for (let k in s) {
            if (!G.notInSearchCriteria.includes(k)) {
                const v = s[k];

                if (k === 'q') {
                    if (s[k].length === 32) {
                        if (s.resource === 'treatments') {
                            criteria.push(`<span class="crit-key">treatmentId</span> is <span class="crit-val">${v}</span>`);
                        }
                        else if (s.resource === 'citations') {
                            criteria.push(`<span class="crit-key">bibRefCitationId</span> is <span class="crit-val">${v}</span>`);
                        }
                    }
                    else {
                        criteria.push(`<span class="crit-val">${v}</span> is in the text`);
                    }
                }
                else {
                    criteria.push(`<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`);
                }
            }
        }

        let l = criteria.length;
        let sc = '';

        if (l === 1) {
            sc += criteria[0];
        }
        else if (l === 2) {
            sc +=  criteria.join(' and ');
        }
        else if (l > 2) {
            l = l - 1;
            sc += criteria.slice(0, l).join(', ') + ', and ' + criteria[l];
        }
        
        return sc;
    },

    toggleFigcaption: function(event) {
        const figcaptions = document.querySelectorAll('figcaption');
        
        // first, close all figcaptions 
        for (let i = 0, j = figcaptions.length; i < j; i++) {
            figcaptions[i].style.maxHeight = G.closedFigcaptionHeight;
            figcaptions[i].style.overflow = 'hidden';
        }

        // now open the clicked figcaption
        const fc = this.parentElement;
        fc.style.maxHeight = '100%';
        fc.style.overflow = 'auto';
        
    },

    // Ocellus is always showing a resource. A resource can be 
    // requested either via the URI (a bookmark or direct entry),
    // or by choosing a resource from the resourceChooser in the
    // form, or by clicking on one of the .togglers, the links that 
    // show (or hide) modals
    resourceFromUrl: function(loc) {
        const {hash, pathname, search} = loc;

        O.base.logger('resourceFromUri()', loc);

        let resource = pathname.split('/').pop().split('.')[0];
        if (resource === '' || resource === 'dev') {
            resource = 'index'
        }
        
        log.info(`- hash: ${hash}`);
        log.info(`- resource: ${resource}`);
        log.info(`- search: ${search}`);

        return {hash, resource, search};
    },

    resourceFromForm: function(event) {
        return document.querySelector('input[name=resource]:checked').value;
    },

    resourceFromModalClick: function(event) {
        const href = event.target.href;

        O.logger('resourceFromUri()', loc);
        log.info(`- href: ${href}`);

        if (href) {
            return href.split('/').pop().split('.').shift();
        }
    },

    _selectResource: function(resource) {

        // remove .searchfocus from all labels
        const ls = document.querySelectorAll('#resourceChooser label');
        const is = document.querySelectorAll('#resourceChooser input');

        for (let i = 0, j = ls.length; i < j; i++) {
            if (is[i].value === resource) {
                is[i].checked = true;
                ls[i].classList.add('searchfocus');
            }
            else {
                is[i].checked = false;
                ls[i].classList.remove('searchfocus');
            }
        }

    },

    selectResource: function(event) {
        const r = event.target;
        const resource = r.value;
        log.info(`selected resource ${resource}`);


        O.base._selectResource(resource);
        O.base.updatePlaceholder(resource);
    },

    updatePlaceholder: function(resource) {
        O.base.logger('updatePlaceholder()', 'updating placeholder');
        if (O.base['num-of-records'][resource]) {
            O.base.setPlaceHolder({
                'num-of-records': O.base['num-of-records'][resource],
                resource: resource
            })
        }
        else {
            O.utils.getResource({
                resource: resource,
                inputs: null,
                cb: O.base.setPlaceHolder
            });
        }
    },

    setPlaceHolder: function(result) {
        if (O.base['num-of-records'][result.resource] == 0) {
            O.base['num-of-records'][result.resource] = result['num-of-records']
        }

        const ph = `search ${result['num-of-records']} ${result.resource}`;
        log.info(`placeholder: "${ph}"`);

        // set focus in the search field and get ready
        const q = document.querySelector('input[name=q]');
        q.placeholder = ph;
        q.focus();
    },

    fetchReceive: function(response) {
        if (!response.ok) {
            throw new Error('HTTP error, status = ' + response.status);
        }

        return response.json();
    },

    hls: function(resource) {
        const rs = document.querySelectorAll('input[name=resource');
        for (let i = 0, j = rs.length; i < j; i++) {

            const r = rs[i];
            const l = r.parentElement;

            if (r.value === resource) {
                log.info(`setting checked of ${r.value} to true`);
                r.checked = true;

                // add searchfocus to its label
                l.classList.add('searchfocus');
                
            }
            else {
                r.checked = false;
                l.classList.remove('searchfocus');
            }
        }
    },

    fillSearchForm: function(search, resource) {
        O.base.logger('fillSearchForm()', 'filling search form');
        log.info(`- search: ${search}`);
        log.info(`- resource: ${resource}`);

        const f = document.querySelector('#searcher');

        // use search to fiil the form
        const s = new URLSearchParams(search);
        for (const [key, value] of s) {
            if (G.validQueryParams.includes(key)) {
                const inputs = f.querySelectorAll(`input[name="${key}"]`);
                for (let i = 0, j = inputs.length; i < j; i++) {
                    const input = inputs[i];

                    if (input.type === 'checkbox') {
                        if (input.value === value) {
                            log.info(`setting checked of ${input.name} with value ${input.value} to 'true'`)
                            input.checked = true;
                        }
                    }
                    else {
                        input.value = value;
                    }
                }
            }
        }

        O.base.hls(resource);
        O.utils.prepareQuery();
    }
}