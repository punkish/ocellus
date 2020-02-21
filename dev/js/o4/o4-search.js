if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

if (!('search' in O)) O.search = {};

/*
JavaScript fancySearch
created by P Kishor
GitHub: https://github.com/punkish/fancysearch
License: Released into the public domain under CC0
*/

/**
 * Represents an instance of fancySearch.
 * 
 * 
        fsp
        ┌─────────────────────────────────────────────────────┐
        │┌──────────┐┏━━━━━━━━━━┓┌──────────┐┏━━━━━━━━━━┓┌───┐│
        ││          │┃ key      ┃│          │┃ val      ┃│ x ││
        │└──────────┘┗━━━━━━━━━━┛└──────────┘┗━━━━━━━━━━┛└───┘│
        └─────────────────────────────────────────────────────┘
        
 * 
 * <div id="fs-container">
 *      <div id="fs-help">some help</div>
 *      <div id="fs-widget">
 *          <div id="fs-params">
 * 
 *              <!-- the following repeats as needed -->
 *              <div class="fs-param-empty|fs-param-filled">
 *                  <div class="fs-key on|off"></div>
 *                  <input class="fs-key-input on|off">
 *                  <div class="fs-val on|off"></div>
 *                  <input class="fs-val-input on|off">
 *                  <div class="fs-cancel off"></div>
 *              </div>
 *              <!-- end div.fs-param-empty -->
 * 
 *          </div>
 *          <button id="fs-go" type="submit" class="fs-button-primary">go</button>
 *      </div>
 *      <div class="fs-throbber"></div>
 * </div>
 * 
 */
O.search.fancySearch = function() {

    let fsHelp;
    let fs;
    //let theParams;
    let paramKeys;
    //let paramValues;
    let resultCb;

    /**
     * create an HTML element
     * 
     * @constructor
     * @param {string} elType - The type of element
     * @param {element} container - HTML element that contains this newly formed element
     * @param {string} id - id of the new element
     * @param {string} class - className of the new element
     * @param {string} type - button-specific type of button property
     * @param {string} text - innerText of the new element
     */
    const elementMaker = function(o) {
        let element = document.createElement(o.elType);
        if (o.id) element.id = o.id;
        if (o.class) element.className = o.class;
        if (o.type) element.type = o.type;
        if (o.text) element.innerText = o.text;
        if (o.html) element.innerHTML = o.html;

        o.container.appendChild(element);

        return element;
    };

    /** 
     * Creates div#fsContainer which contains the entire fancySearch machinery
     * @param {string} selector - HTML element that will house fancySearch
     * 
     */
    const makeFsContainer = function(selector) {

        fsHelp = elementMaker({
            elType: 'div', 
            id: 'fs-help', 
            class: 'fs-help',
            html: 'choose a param from the dropdown',
            container: selector
        });

        let fsw = elementMaker({
            elType: 'div', 
            id: 'fs-widget', 
            class: 'fs-widget',
            container: selector
        });

        fs = elementMaker({
            elType: 'div', 
            id: 'fs', 
            class: 'fs', 
            container: fsw
        });

        let fsb = elementMaker({
            elType: 'button', 
            id: 'fs-go', 
            type: 'submit', 
            class: 'fs-button-primary', 
            text: 'go', 
            container: fsw
        });

        fsb.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            result(resultCb);
        });

        // makeFsKvElements();

    };

    const activateFsKvElements = function(fskInput, fsvInput, fsc) {
        fskInput.addEventListener('keydown', modifyKeyPress);
        fsvInput.addEventListener('keydown', modifyKeyPress);
        fsc.addEventListener('click', removeFsp);

        aCfacets('key', fskInput, paramKeys);
        fskInput.focus();
    };

    const makeFsKvElements = function() {

        /*
        fsp
        ┌─────────────────────────────────────────────────────┐
        │┌──────────┐┏━━━━━━━━━━┓┌──────────┐┏━━━━━━━━━━┓┌───┐│
        ││          │┃ key      ┃│          │┃ val      ┃│ x ││
        │└──────────┘┗━━━━━━━━━━┛└──────────┘┗━━━━━━━━━━┛└───┘│
        └─────────────────────────────────────────────────────┘
        */

        let fsp = elementMaker({
            elType: 'div', 
            class: 'fs-param-empty',
            container: fs
        });
    
        elementMaker({
            elType: 'div', 
            class: 'fs-key fs-off',
            container: fsp
        });

        let fskInput = elementMaker({
            elType: 'input', 
            class: 'fs-key-input',
            container: fsp
        });
    
        elementMaker({
            elType: 'div', 
            class: 'fs-val fs-off',
            container: fsp
        });

        let fsvInput = elementMaker({
            elType: 'input', 
            class: 'fs-val-input fs-off',
            container: fsp
        });
    
        let fsc = elementMaker({
            elType: 'div', 
            class: 'fs-cancel fs-off',
            text: 'x',
            container: fsp
        });
    
        return [fskInput, fsvInput, fsc];
    };

    const modifyKeyPress = function(event) {
        
        const ENTER = 13;
        const BACKSPACE = 8;
        const DEL = 46;
    
        event = event || window.event;
        const keyPressed = event.which || event.keyCode;

        let thisInput = event.target;
        let fsp = thisInput.parentElement;
        let fsk = fsp.children[0];
        let fskInput = fsp.children[1];
        let fsv = fsp.children[2];
        let fsvInput = fsp.children[3];
        let fsc = fsp.children[4];
        
        if (keyPressed == ENTER) {
            
            if (fsvInput.value !== '') {
                fsp.className = 'fs-param-filled';
                fsv.innerText = fsvInput.value;
                fsv.className = 'fs-val fs-on';
                fsvInput.className = 'fs-off';
                fsc.className = 'fs-cancel fs-on';
    
                makeFsKvElements();
            }
    
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        else if (keyPressed == BACKSPACE || keyPressed == DEL) {
            if (thisInput.value === '') {

                let allFsp = document.querySelectorAll('div.fs-param-filled');
                let lastFsp = allFsp[allFsp.length - 1];
    
                if (lastFsp) {
                    if (lastFsp.className === 'fs-param-filled') {
                        lastFsp.className = 'fs-param-filled fs-hilite';
                    }
                    else if (lastFsp.className = 'fs-param-filled fs-hilite') {
                        lastFsp.parentElement.removeChild(lastFsp);
                    }
                }
                else {
                    allFsp = document.querySelectorAll('div.fs-param-empty');
                    lastFsp = allFsp[allFsp.length - 1];

                    lastFsp.parentElement.removeChild(lastFsp);
                }
                
            }
        }
    };
    
    const removeFsp = function(event) {
        const that = this.parentElement;
        that.parentElement.removeChild(that);
    };

    const aCfacets = function(type, selector, choices) {
        
        new autoComplete({
            selector: selector,
            minChars: Array.isArray(choices) ? 0 : 3,
            source: function(term, response) {
    
                if (Array.isArray(choices)) {
                    if (choices.length > 0) {
                        term = term.toLowerCase();
                        let matches = [];
                        let j = choices.length;
            
                        for (let i = 0; i < j; i++) {
                            if (~choices[i].toLowerCase().indexOf(term)) {
                                matches.push(choices[i]);
                            }
                        }

                        response(matches);
                    }
                }
                else {
                    try {
                        xhr.abort();
                    } 
                    catch(e) {
                        
                    }
                    xhr(choices + '?q=' + term, response);
                }
            },

            onSelect: function(e, term, item) {
    
                let newChoices;
                let prompt;
                let thisInput = this.selector;
                let fsp = thisInput.parentElement;
                const params = O.default.search.fancyParams;
                const j = params.length;
                
                if (type === 'key') {
                    
                    let fsk = fsp.children[0];
                    fsk.innerText = thisInput.value + ':';
                    fsk.className = 'fs-key fs-on';
                    thisInput.className = 'fs-off';
    
                    for (let i = 0; i < j; i++) {
                        if (params[i]['key'] === term) {
                            newChoices = params[i]['values'];
                            prompt = params[i]['prompt'];
                            if (params[i]['noDuplicates']) {
                                paramKeys.splice(paramKeys.indexOf(term), 1);
                            }
                            break;
                        }
                    }
    
                    let nextInput = fsp.children[3];
                    nextInput.className = 'fs-val-input fs-on';
                    fsHelp.innerHTML = prompt;
                    
                    aCfacets('val', nextInput, newChoices);
                    nextInput.focus();
                }
                else if (type === 'val') {
                    fsHelp.innerHTML = 'choose a facet from the dropdown';
    
                    let fsv = fsp.children[2];
                    
                    if (term) {
                        fsv.innerText = thisInput.value;
                        fsv.className = 'fs-val fs-on';
                    }
                    
                    thisInput.className = 'fs-off';
                    fsp.className = 'fs-param-filled';
                    fsp.children[4].className = 'fs-cancel fs-on';
    
                    for (let i = 0; i < j; i++) {
                        if (params[i]['key'] === term) {
                            newChoices = params[i]['values'];
                            break;
                        }
                    }
    
                    // make the next fsp
                    makeFsKvElements();
                }
            }
        });
    };

    const xhr = function(href, cb) {
        let x = new XMLHttpRequest();

        x.onload = function(event) {
            if (x.readyState === 4) {
                if (x.status === 200) {
                    const res = JSON.parse(x.responseText);
                    cb(res);
                }
            }
        };

        x.onerror = function(e) {
            console.error(x.statusText);
        };

        x.open("GET", href, true);
        x.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        x.send();
    };

    /**
     * Package content of fs into a JSON object
     * @param {*} cb 
     */
    const result = function(cb) {
        
        const params = fs.childNodes;
        let q = {};
        for (let i = 0, j = params.length; i < j; i++) {
            const kv = params[i].children;
    
            // https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
            const key = kv[1].value;
            const val = kv[3].value.replace(/\n$/, '');
    
            if (key && val) {
                if (key in q) {
                    if (typeof(q[key]) === 'string') {
                        const str = q[key];
                        q[key] = [str, val]
                    }
                    else {
                        q[key].push(val);
                    }
                }
                else {
                    q[key] = val;
                }
            }
        }
        
        //return q;
        cb(q);
    };

    const fillInputField = function(key, val) {
        const fsp = elementMaker({
            elType: 'div', 
            class: 'fs-param-empty',
            container: fs
        });
    
        const fsk = elementMaker({
            elType: 'div', 
            class: 'fs-key fs-off',
            container: fsp
        });

        const fskInput = elementMaker({
            elType: 'input', 
            class: 'fs-key-input',
            container: fsp
        });
    
        const fsv = elementMaker({
            elType: 'div', 
            class: 'fs-val fs-off',
            container: fsp
        });

        const fsvInput = elementMaker({
            elType: 'input', 
            class: 'fs-val-input fs-off',
            container: fsp
        });
    
        const fsc = elementMaker({
            elType: 'div', 
            class: 'fs-cancel fs-off',
            text: 'x',
            container: fsp
        });

        fsk.innerText = key + ':';
        fsk.className = 'fs-key fs-on';

        fskInput.className = 'fs-off';
        fsvInput.className = 'fs-val-input fs-off';
                    
        fsv.innerText = val;
        fsv.className = 'fs-val fs-on';
     
        fsp.className = 'fs-param-filled';
        fsc.className = 'fs-cancel fs-on';

    };

	return  {

        /**
         * create an instance of fancySearch.
         * @constructor
         * @param {div} selector - The div where fancySearch should be initiated.
         * @param {array} params - The params to use for this instance of fancySearch.
         * @param {func} doSomethingWithQuery - Ingest the JSON object with fancySearch selection, and do something with it.
         */
		init: function(selector, params, doSomethingWithQuery, queryObject) {
            
            // https://stackoverflow.com/questions/7028145/find-key-name-in-hash-with-only-one-key
            theParams = params;
            paramKeys = params.map(element => { return element['key'] });
            paramValues = params.map(element => { return element['values'] });
            resultCb = doSomethingWithQuery;
            
            makeFsContainer(selector);
            
            const exclude = ['page', 'size', 'refreshCache']
            if (queryObject) {

                for (let key in queryObject) {

                    const val = queryObject[key];

                    if (key === 'communities') {

                        let i = 0;
                        const j = O.base.dom.communityCheckBoxes.length

                        for (; i < j; i++) {
                            const chkbox = O.base.dom.communityCheckBoxes[i];
                            chkbox.checked = val === chkbox.value ? true : false;
                        }

                    }
                    else {

                        if (!exclude.includes(key)) {
                            fillInputField(key, val);
                        }
                    }
                }

            }
            else {
                const [fskInput, fsvInput, fsc] = makeFsKvElements();
                activateFsKvElements(fskInput, fsvInput, fsc);
            }
		}
    };
    
};

O.search.initializeFancySearch = function(state) {

    log.info(`initializing fancy search with state ${state}`);

    let queryObject = '';
    if (state === 'filled') {
        queryObject = O.utils.loc2qryObj();
    }

    const fs = new O.search.fancySearch();
    fs.init(
        O.base.dom.fs, 
        O.default.search.fancyParams,
        //O.base.fs.doSomethingWithQuery,
        O.eventlisteners.goGetIt,
        queryObject
    );

};

O.search.activateSearchSwitcher = function() {

    const othersearch = O.base.searchType === 'simple' ? 'fancy search' : 'simple search';
    log.info(`activating switcher to switch to ${othersearch}`);

    // see https://stackoverflow.com/questions/59079116/location-hash-gets-updated-with-value-of-a-links-new-hash-that-is-replaced-aft/59079212#59079212

    // setTimeout(() => O.base.dom.toggleSearchLink.hash = `#search=${othersearch.replace(' search', '')}`, 100); 
    // O.base.dom.toggleSearchLink.innerHTML = `switch to ${othersearch}`;
    
    // O.base.dom.toggleSearchLink.addEventListener('click', O.eventlisteners.toggleSearch);
};

O.search.initializeSimpleSearch = function(state) {

    log.info(`state: ${state}`);

    log.info(`initializing simple search with state ${state}`);

    // add all the events
    O.eventlisteners.activateUrlFlagSelectors();
    O.base.dom.communitiesSelector.addEventListener('click', O.eventlisteners.toggleCommunities);
    O.base.dom.refreshCacheSelector.addEventListener('click', O.eventlisteners.toggleRefreshCache);

    O.utils.suggest(O.base.dom.q);

    O.base.dom.go.addEventListener('click', O.eventlisteners.goGetIt);
    O.base.dom.form.addEventListener('submit', O.eventlisteners.goGetIt);

    O.search.activateSearchSwitcher();
    
    if (state === 'empty') {

        // set resource and get basic stats to set the placeholder
        O.base.resource = O.default.resource;
        O.utils.setPlaceHolder(O.base.resource);
        O.base.dom.q.focus();

    }
    else if (state === 'filled') {

        let s = location.search;

        // remove leading '?'
        if (s.substr(0, 1) === '?') s = s.substr(1);

        const params = s.split('&');

        for (let i = 0, j = params.length; i < j; i++) {
            const [k, v] = params[i].split('=');

            const inputs = O.base.dom.form.querySelectorAll(`input[name=${k}`);

            for (let i = 0, j = inputs.length; i < j; i++) {
                const input = inputs[i];
                if (input.name === k) {
                    if (input.type === 'checkbox') {
                        if (input.value === v) {
                            log.info(`setting checked of ${input.name} to 'true'`)
                            input.checked = true;
                        }
                    }
                    else {
                        input.value = v;
                    }
                } 
            }
        }
        
    }
    
};

O.search.setSearchType = function(state) {

    if (O.base.searchType === 'simple') {
        O.search.initializeSimpleSearch(state);
    }
    else if (O.base.searchType === 'fancy') {
        O.search.initializeFancySearch(state);
    }

    O.utils.toggleSearchType();
};