/*
JavaScript fancySearch
created by P Kishor
GitHub: https://github.com/punkish/fancysearch
License: Released into the public domain under CC0
*/

'use strict';

/**
 * Represents an instance of fancySearch.
 * 
 * <div id="fs-container">
 *      <div id="fs-widget">
 *          <div id="fs">
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
 * </div>
 * 
 */
const fancySearch = function() {

    let fs;
    let theFacets;
    let facetKeys;
    //let facetValues;
    let resultCb;

    /**
     * create an HTML element
     * 
     * @constructor
     * @param {string} element - The HTML element to be constructed
     * @param {element} container - HTML element that contains this newly formed element
     * @param {string} id - id of the new element
     * @param {string} class - className of the new element
     * @param {string} type - button- or input-specific type of button property
     * @param {string} text - innerText of the new element
     */
    const elementMaker = function(o) {
        let element = document.createElement(o.element);
        if (o.id) element.id = o.id;
        if (o.name) element.name = o.name;
        if (o.class) element.className = o.class;
        if (o.type) element.type = o.type;
        if (o.text) element.innerText = o.text;
        if (o.html) element.innerHTML = o.html;
        if (o.prompt) element.placeholder = o.prompt;

        o.container.appendChild(element);

        return element;
    };

    /** 
     * Creates div#fs-container which contains the entire fancySearch machinery
     * @param {string} selector - HTML element that will house fancySearch
     * 
     */
    const makeFsContainer = function(selector) {

        let fsw = elementMaker({
            element: 'div', 
            id: 'fs-widget', 
            class: 'fs-widget',
            container: selector
        });

        fs = elementMaker({
            element: 'div', 
            id: 'fs', 
            class: 'fs', 
            container: fsw
        });

        let fsselect = elementMaker({
            element: 'select',
            name: 'communities',
            container: fs
        });

        let fsrc = elementMaker({
            element: 'input',
            type: 'checkbox',
            class: 'fs-refreshCache',
            id: 'fs-refreshCache',
            container: fs
        });

        fsrc.addEventListener('click', function(event) {
            const rc = document.querySelector('#fs-refreshCache');
            const rcw = document.querySelector('#refreshCacheWarning');

            if (rc.checked) {
                rcw.classList.remove('off-block');
                rcw.classList.add('on');
            }
            else {
                rcw.classList.remove('on');
                rcw.classList.add('off-block');
            }
        });

        let fsb = elementMaker({
            element: 'button', 
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

        makeFsKvElements();
    };

    /** 
     * Creates div#fs-param-empty which contains the fs-key and fs-val
     * divs and respective input fields in which the user enters data
     * @param {string} selector - HTML elements for fancySearch
     * 
     */
    const makeFsKvElements = function(prompt) {

        let fsp = elementMaker({
            element: 'div', 
            class: 'fs-param-empty',
            container: fs
        });
    
        elementMaker({
            element: 'div', 
            class: 'fs-key fs-off',
            container: fsp
        });

        let fskInput = elementMaker({
            element: 'input', 
            class: 'fs-key-input',
            prompt: 'choose a searchterm',
            container: fsp
        });
    
        elementMaker({
            element: 'div', 
            class: 'fs-val fs-off',
            container: fsp
        });

        let fsvInput = elementMaker({
            element: 'input', 
            class: 'fs-val-input fs-off',
            container: fsp
        });
    
        let fsc = elementMaker({
            element: 'div', 
            class: 'fs-cancel fs-off',
            text: 'x',
            container: fsp
        });
    
        fskInput.addEventListener('keydown', modifyKeyPress);
        fsvInput.addEventListener('keydown', modifyKeyPress);
        fsc.addEventListener('click', removeFsp);

        aCfacets('key', fskInput, facetKeys);
        fskInput.focus();
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

        // First, we select fs-param-empty and fs-param-filled. At any
        // given time, there can be zero or more fs-param-filled, but 
        // there will always be one and only one fs-param-empty
        //
        // .fs-param-empty
        const fse = document.querySelectorAll('.fs-param-empty');

        // .fs-param-filled
        const fsf = document.querySelectorAll('.fs-param-filled');
        
        if (keyPressed == ENTER) {
            
            // no complete entry has been made so the there will be 
            // no fs-param-filled div
            if (fsf.length == 0) {

                const fseKey = fse[0].childNodes[0]; // fs-key div
                const fseKin = fse[0].childNodes[1]; // fs-key input
                const fseVal = fse[0].childNodes[2]; // fs-val div
                const fseVin = fse[0].childNodes[3]; // fs-val input

                // the user hasn't even begun entering anything
                if (fseKey.innerHTML === '') {
                    fseKin.placeholder = 'Please choose a searchterm';
                    fseKin.classList.add('warning');
                }
                else {

                    // the user chose a searchterm but hasn't provided
                    // any value for it, so make the placeholder red
                    if (fseVin.value === '') {
                        fseVin.classList.add('warning');
                    }
                    else {

                        // the user chose a searchterm and has also
                        // provided a value for it, so complete the 
                        // entry by making the param fs-param-filled
                        // and make a new fs-param-empty
                        fsp.className = 'fs-param-filled';
                        fsv.innerText = fsvInput.value;
                        fsv.className = 'fs-val fs-on';
                        fsvInput.className = 'fs-off';
                        fsc.className = 'fs-cancel fs-on';
                        makeFsKvElements();
                    }
                }
                
            }

            // at least one valid entry has been made
            else {

                // the last entry is empty
                if (fseKey.innerHTML === '') {
                    result(resultCb);
                }
                
                // the last entry was started but not finished
                else {

                    // the user chose a searchterm but hasn't provided
                    // any value for it, so make the placeholder red
                    if (fseVin.value === '') {
                        fseVin.classList.add('warning');
                    }
                    else {

                        // the user chose a searchterm and has also
                        // provided a value for it, so complete the 
                        // entry by making the param fs-param-filled
                        // and make a new fs-param-empty
                        fsp.className = 'fs-param-filled';
                        fsv.innerText = fsvInput.value;
                        fsv.className = 'fs-val fs-on';
                        fsvInput.className = 'fs-off';
                        fsc.className = 'fs-cancel fs-on';
                        makeFsKvElements();
                    }
                }
            }
    
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        else if (keyPressed == BACKSPACE || keyPressed == DEL) {
            if (thisInput.value === '') {

                let allFsp = document.querySelectorAll(`div#${fsDiv.id} div.fs-param-filled`);
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

                    let allFsp = document.querySelectorAll(`div#${fsDiv.id} div.fs-param-empty`);
                    let lastFsp = allFsp[allFsp.length - 1];

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
                    xhr(choices + '/' + term, response);
                }
            },

            onSelect: function(e, term, item) {
    
                let newChoices;
                let prompt;
                let thisInput = this.selector;
                let fsp = thisInput.parentElement;
                
                if (type === 'key') {
                    
                    let fsk = fsp.children[0];
                    fsk.innerText = thisInput.value + '';
                    fsk.className = 'fs-key fs-on';
                    thisInput.className = 'fs-off';
    
                    let i = 0;
                    let j = theFacets.length;
    
                    for (; i < j; i++) {
                        if (theFacets[i]['key'] === term) {
                            newChoices = theFacets[i]['values'];
                            prompt = theFacets[i]['prompt'];
                            if (theFacets[i]['noDuplicates']) {
                                facetKeys.splice(facetKeys.indexOf(term), 1);
                            }
                            break;
                        }
                    }

                    let nextInput = fsp.children[3];
                    nextInput.className = 'fs-val-input fs-on';
                    nextInput.placeholder = prompt;
                    // fsHelp.innerHTML = prompt;
                    // fsHelp.classList.remove('warning');
                    
                    aCfacets('val', nextInput, newChoices);
                    nextInput.focus();
                }
                else if (type === 'val') {
                    //fsHelp.innerHTML = 'choose a searchterm from the dropdown';
    
                    let fsv = fsp.children[2];
                    
                    if (term) {
                        fsv.innerText = thisInput.value;
                        fsv.className = 'fs-val fs-on';
                    }
                    
                    thisInput.className = 'fs-off';
                    fsp.className = 'fs-param-filled';
                    fsp.children[4].className = 'fs-cancel fs-on';
    
                    let i = 0;
                    let j = theFacets.length;
    
                    for (; i < j; i++) {
                        if (theFacets[i]['key'] === term) {
                            newChoices = theFacets[i]['values'];
                            break;
                        }
                    }
    
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
        
        const params = document.querySelectorAll('.fs-param-filled');
        let qry = {};
        for (let i = 0, j = params.length; i < j; i++) {
            const kv = params[i].children;
    
            // https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
            const key = kv[1].value;
            const val = kv[3].value.replace(/\n$/, '');
    
            if (key && val) {
                if (key in qry) {
                    if (typeof(qry[key]) === 'string') {
                        const str = qry[key];
                        qry[key] = [str, val]
                    }
                    else {
                        qry[key].push(val);
                    }
                }
                else {
                    qry[key] = val;
                }
            }
        }
        
        //return q;
        cb(qry);
    };

	return  {

        /**
         * create an instance of fancySearch.
         * @constructor
         * @param {div} selector - The div where fancySearch should be initiated.
         * @param {array} facets - The facets to use for this instance of fancySearch.
         * @param {func} doSomethingWithQuery - Ingest the JSON object with fancySearch selection, and do something with it.
         */
		init: function(selector, facets, doSomethingWithQuery) {
            
            // https://stackoverflow.com/questions/7028145/find-key-name-in-hash-with-only-one-key
            theFacets = facets;
            facetKeys = facets.map(element => { return element['key'] });
            //facetValues = facets.map(element => { return element['values'] });
            resultCb = doSomethingWithQuery;
            
            makeFsContainer(selector);
		}
	};
};