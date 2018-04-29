/*
JavaScript fancySearch
created by P Kishor
GitHub: https://github.com/punkish/fancysearch
License: Released into the public domain under CC0
*/

'use strict';

/**
 * Represents an instance of fancySearch. Allows specifying multiple parameters
 * for a search while using a single search input field. Inspired by 
 * visualsearch.js but without its cruft of jQuery, underscore and backbone
 * 
 * <div id="fs-container">
 *      <div id="fs-help">some help</div>
 *      <div id="fs-widget">
 *          <div id="fs-field">
 *              <div id="fs-params">
 * 
 *                  <!-- the following fs-params container repeats as many times as needed -->
 *                  <div class="fs-param-empty|fs-param-filled">
 *                      <div class="fs-key on|off"></div>
 *                      <input class="fs-key-input on|off">
 *                      <div class="fs-val on|off"></div>
 *                      <input class="fs-val-input on|off">
 *                      <div class="fs-remove off"></div>
 *                  </div>
 *                  <!-- end fs-params container -->
 * 
 *              </div>
 *              <div id="fs-reset">x</div>
 *          </div>
 *          <button id="fs-go" type="submit" class="fs-button-primary">go</button>
 *      </div>
 * </div>
 * 
 */
const fancySearch = function() {

    // Local variables
    let fsContainer;
    let fsHelp;
    let fs;
    let fsParams;
    let theFacets;
    let facetKeys;
    let facetValues;
    let resultCb;
    const widgetMsg = 'choose a param from the dropdown, or enter any text';

    /**
     * create an HTML element
     * 
     * @constructor
     * @param {string} elType - The type of element
     * @param {string} id - id of the new element
     * @param {string} class - className of the new element
     * @param {string} type - button-specific type of button property
     * @param {string} text - innerText of the new element
     * @param {element} html - HTML for the newly formed element
     * @param {element} container - HTML element that contains this newly formed element
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
    const makeFsContainer = function() {

        fsHelp = elementMaker({
            elType: 'div', 
            id: 'fs-help', 
            html: widgetMsg,
            container: fsContainer,
            class: 'fs-help'
        });

        let fsWidget = elementMaker({
            elType: 'div', 
            id: 'fs-widget', 
            container: fsContainer
        });

        let fsField = elementMaker({
            elType: 'div', 
            id: 'fs-field', 
            container: fsWidget
        });

        fsParams = elementMaker({
            elType: 'div', 
            id: 'fs-params', 
            class: 'fs-params', 
            container: fsField
        });

        let fsReset = elementMaker({
            elType: 'div', 
            id: 'fs-reset',
            text: 'x',
            container: fsField
        });

        let fsButton = elementMaker({
            elType: 'button', 
            id: 'fs-go', 
            type: 'submit', 
            class: 'fs-button-primary', 
            text: 'go', 
            container: fsWidget
        });

        fsButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            result(resultCb, fsButton);
            fsButton.disabled = true;
            fsButton.className = 'fs-button-primary fs-button-disabled';
        });

        fsReset.addEventListener('click', resetWidet);
        makeFsParams();
    };

    /** 
     * Creates the fancySearch params for facets repeatedly
     * 
     */
    const makeFsParams = function() {
        
        let fsTable = elementMaker({
            elType: 'table',
            class: 'fs-param-empty',
            container: fsParams
        });

        let fsTbody = elementMaker({
            elType: 'tbody',
            container: fsTable
        });

        let fsRow = elementMaker({
            elType: 'tr',
            container: fsTbody
        });

        let fsTd0 = elementMaker({
            elType: 'td',
            class: 'fs-off',
            container: fsRow
        });

        elementMaker({
            elType: 'div', 
            class: 'fs-key',
            container: fsTd0
        });

        let fsTd1 = elementMaker({
            elType: 'td',
            container: fsRow
        });

        let fskInput = elementMaker({
            elType: 'input', 
            class: 'fs-key-input',
            container: fsTd1
        });

        let fsTd2 = elementMaker({
            elType: 'td',
            class: 'fs-off',
            container: fsRow
        });

        elementMaker({
            elType: 'div', 
            class: 'fs-val',
            container: fsTd2
        });

        let fsTd3 = elementMaker({
            elType: 'td',
            class: 'fs-off',
            container: fsRow
        });

        let fsvInput = elementMaker({
            elType: 'input', 
            class: 'fs-val-input',
            container: fsTd3
        });

        let fsTd4 = elementMaker({
            elType: 'td',
            class: 'fs-off',
            container: fsRow
        });

        let fsRemove = elementMaker({
            elType: 'div', 
            class: 'fs-remove',
            text: 'x',
            container: fsTd4
        });

        fskInput.addEventListener('keydown', modifyKeyPress);
        fsvInput.addEventListener('keydown', modifyKeyPress);
        fsRemove.addEventListener('click', removeFsp);

        aCfacets('key', fskInput, facetKeys);
        fskInput.focus();
    
        /*
        let fsp = elementMaker({
            elType: 'div', 
            class: 'fs-param-empty',
            container: fsParams
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
    
        let fsRemove = elementMaker({
            elType: 'div', 
            class: 'fs-remove fs-off',
            text: 'x',
            container: fsp
        });
        */
    };

    /** 
     * Modifies the key press/down events to catch the delete/backspace key
     * @param {event} event - key event
     * 
     */
    const modifyKeyPress = function(event) {
        
        const ENTER = 13;
        const BACKSPACE = 8;
        const DEL = 46;
    
        event = event || window.event;
        const keyPressed = event.which || event.keyCode;

        let [
            fsParam,
            fsKeyTd,
            fsKey,
            fsKeyInputTd,
            fsKeyInput,
            fsValTd,
            fsVal,
            fsValInputTd,
            fsValInput,
            fsRemoveTd,
            fsRemove
        ] = getParamElements(event.target);
        
        if (keyPressed == ENTER) {
            
            // if fsParams is completely empty, that means  
            // nothing has been entered yet
            if (fsKeyInput.value === '' && fsValInput.value === '') {
                if ("no other kv have been entered") {
                    console.log('nothing entered');
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                else {
                    //submit the form;
                }
            }

            
            else if (fsKeyInput.value !== '' && fsValInput.value === '') {
                if (facetKeys.indexOf(fsKeyInput.value) > -1) {
                    console.log("enter a value");
                }

                // if only a fsKey was entered but fsValue is still 
                // empty it would be considered a free text entry
                else {

                    // Because no value has been entered, but there is text 
                    // for the key, first, set value to key
                    fsVal.innerText = fsKeyInput.value;
                    fsValInput.value = fsKeyInput.value;
                    fsValTd.className = 'fs-val-td fs-on';
                    fsValInputTd.className = 'fs-off';

                    fsKey.innerText = 'q';
                    fsKeyInput.value = 'q';
                    fsKeyTd.className = 'fs-key-td fs-on';
                    fsKeyInputTd.className = 'fs-off';

                    fsParam.className = 'fs-param-filled';
                    fsRemoveTd.className = 'fs-remove-td fs-on';

                    makeFsParams();

                    event.preventDefault();
                    event.stopPropagation();
                    //return false;
                }
            }

            // fsKey is empty but fsValue is filled
            // this can't happen

            // if both fsKey and fsValue are filled
            else if (fsKeyInput.value !== '' && fsValInput.value !== '') {
                console.log(fsKeyInput.value, fsValInput.value);

                fsKey.innerText = fsKeyInput.value;
                fsKeyTd.className = 'fs-key-td fs-on';
                fsKeyInputTd.className = 'fs-off';

                fsVal.innerText = fsValInput.value;
                fsValTd.className = 'fs-val-td fs-on';
                fsValInputTd.className = 'fs-off';

                fsParam.className = 'fs-param-filled';
                fsRemoveTd.className = 'fs-remove-td fs-on';

                makeFsParams();

                event.preventDefault();
                event.stopPropagation();
                //return false;
            }
        }
        else if (keyPressed == BACKSPACE || keyPressed == DEL) {
            if (event.target.value === '') {

                let allFsp = document.querySelectorAll(`div#fs-params div.fs-param-filled`);
                let lastFsp = allFsp[allFsp.length - 1];
    
                if (lastFsp) {
                    if (lastFsp.className === 'fs-param-filled') {
                        lastFsp.className = 'fs-param-filled fs-hilite';
                        fsHelp.innerHTML = 'this parameter will be removed';
                        fsHelp.className = 'fs-warning';
                    }
                    else if (lastFsp.className = 'fs-param-filled fs-hilite') {
                        lastFsp.parentElement.removeChild(lastFsp);
                        fsHelp.innerHTML = 'poof!';
                        fsHelp.className = 'fs-help';
                        fs.destroy();
                    }
                }
                else {

                    let allFsp = document.querySelectorAll(`div#fs-params div.fs-param-empty`);
                    let lastFsp = allFsp[allFsp.length - 1];

                    lastFsp.parentElement.removeChild(lastFsp);
                }
                
            }
        }
    };
    
    /** 
     * Deletes a fancySearch element on account of delete/backspace key
     * @param {event} event - key event
     * 
     */
    const removeFsp = function(event) {
        const that = this.parentElement;
        that.parentElement.removeChild(that);
    };

    /** 
     * Resets the form by emptying the widgets div
     * @param {event} event - key event
     * 
     */
    const resetWidet = function(event) {
        fsContainer.innerHTML = '';
        makeFsContainer();
    };

    /** 
     * Creates the auto-complete dropdown for facets
     * @param {string} type - 'key' or 'val'
     * @param {string} selector - the div to target for auto-complete
     * @param {string} choices - array of choices
     * 
     */
    const aCfacets = function(type, selector, choices) {
        
        fs = new autoComplete({
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
                        // TODO: fix this
                        xhr.abort();
                    } 
                    catch(e) {
                        //console.log(e);
                    }
                    xhr(choices + '/' + term, response);
                }
            },

            onSelect: function(e, term, item) {

                let newChoices;
                let prompt;
                let [
                    fsParam,
                    fsKeyTd,
                    fsKey,
                    fsKeyInputTd,
                    fsKeyInput,
                    fsValTd,
                    fsVal,
                    fsValInputTd,
                    fsValInput,
                    fsRemoveTd,
                    fsRemove
                ] = getParamElements(this.selector);
                
                if (type === 'key') {
                    
                    fsKey.innerText = fsKeyInput.value + ':';
                    fsKeyTd.className = 'fs-key-td fs-on';
                    fsKeyInputTd.className = 'fs-off';
    
                    let i = 0;
                    let j = facets.length;
    
                    for (; i < j; i++) {
                        if (facets[i]['key'] === term) {
                            newChoices = facets[i]['values'];
                            prompt = facets[i]['prompt'];

                            // Remove the used facetKey from the array of 
                            // facetKeys if it is marked as 'noDuplicates'
                            if (facets[i]['noDuplicates']) {
                                facetKeys.splice(facetKeys.indexOf(term), 1);
                            }
                            
                            break;
                        }
                    }
    
                    // let nextInput = fsp.children[3];
                    // nextInput.className = 'fs-val-input fs-on';
                    fsHelp.innerHTML = prompt;
                    fsValInputTd.className = 'fs-on';
                    aCfacets('val', fsValInput, newChoices);
                    fsValInput.focus();
                }
                else if (type === 'val') {
                    fsHelp.innerHTML = widgetMsg;
    
                    //let fsv = fsp.children[2];
                    if (term) {
                        fsVal.innerText = fsValInput.value;
                        fsValTd.className = 'fs-val-td fs-on';
                        fsValInputTd.className = 'fs-off';
                    }
                    
                    fsKeyInputTd.className = 'fs-off';
                    fsParam.className = 'fs-param-filled';
                    fsRemoveTd.className = 'fs-remove-td fs-on';
    
                    let i = 0;
                    let j = facets.length;
    
                    for (; i < j; i++) {
                        if (facets[i]['key'] === term) {
                            newChoices = facets[i]['values'];
                            break;
                        }
                    }
    
                    makeFsParams();
                }
            }
        });
    };

    const getParamElements = function(target) {
        let thisRow = target.parentElement.parentElement;
        
        return [
            thisRow.parentElement.parentElement,
            thisRow.childNodes[0],
            thisRow.childNodes[0].childNodes[0],
            thisRow.childNodes[1],
            thisRow.childNodes[1].childNodes[0],
            thisRow.childNodes[2],
            thisRow.childNodes[2].childNodes[0],
            thisRow.childNodes[3],
            thisRow.childNodes[3].childNodes[0],
            thisRow.childNodes[4],
            thisRow.childNodes[4].childNodes[0]
        ];
    };

    /** 
     * ajax mechanism
     * @param {string} href - ajax url
     * @param {function} cb - to do after the query is complete
     * 
     */
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
     * Package content of fs-params into a JSON object
     * @param {*} cb 
     */
    const result = function(cb, button) {
        
        console.trace();
        // each childNode of 'fs' is a kv pair of values
        const params = document.querySelectorAll('.fs-param-filled');

        let q = {};
        for (let i of params) {
            const key = i.querySelector('.fs-key').innerText;
            const val = i.querySelector('.fs-val').innerText;

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
        /*
        for (let i = 0, j = params.length; i < j; i++) {
            const kv = params[i].children[0].childNodes[0].childNodes;
            console.log(kv);
            
            // https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
            const key = kv[0].value;
            const val = kv[2].value.replace(/\n$/, '');
    
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
        */
        
        //return q;
        console.log(q);
        cb(q, button);
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
            
            fsContainer = selector;
            theFacets = facets;

            // https://stackoverflow.com/questions/7028145/find-key-name-in-hash-with-only-one-key
            facetKeys = facets.map(element => { return element['key'] });
            facetValues = facets.map(element => { return element['values'] });

            // we store the cb function so we can use it later when
            // we are ready to submit the query
            resultCb = doSomethingWithQuery;
            
            makeFsContainer();
		}
	};
};
