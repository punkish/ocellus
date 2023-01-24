/*
 * JavaScript fancySearch
 * created by P Kishor
 * GitHub: https://github.com/punkish/fancysearch
 * License: Released into the public domain under CC0
 */

'use strict';

/*
 * Represents an instance of fancySearch.
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
 *          <button id="fs-go" type="submit" class="fs-button-primary">
 *              go
 *          </button>
 *      </div>
 *      <div class="fs-throbber"></div>
 * </div>
 * 
 */

/**
 * create an instance of fancySearch.
 * @constructor
 * @param {div} selector - The div where fancySearch should be initiated.
 * @param {array} facets - The facets to use for this instance of fancySearch.
 * @param {func} doSomethingWithQuery - Ingest the JSON object with fancySearch selection, and do something with it.
 */
const fancySearch = function({ selector, helpText, facets, cb }) {

    //const theFacets = facets;
    const facetKeys = facets.map(f => f.key);
    //const facetValues = facets.map(f => f.values);
    const resultCb = cb;
    
    let fsHelp;
    let fs;
    //let theFacets;
    //let facetKeys;
    //let facetValues;
    //let resultCb;

    /**
     * create an HTML element
     * 
     * @constructor
     * @param {string} element - The element to make, for eg, 'div' or 'input'
     * @param {element} container - element that contains the new element
     * @param {object} attribs - attributes of the new element
     */
    const elementMaker = function({ element, attribs, container }) {
        const el = document.createElement(element);

        for (let [key, val] of Object.entries(attribs)) {
            if (key === 'innerText' || key === 'innerHTML') {
                el[key] = val;
            }
            else {
                el.setAttribute(key, val);
            }
        }

        container.appendChild(el);

        return el;
    };

    /** 
     * Creates div#fsContainer which contains the entire fancySearch machinery
     * @param {string} selector - HTML element that will house fancySearch
     * 
     */
    const makeFsContainer = function(selector, helpText) {

        // fsHelp = elementMaker({
        //     element: 'div', 
        //     attribs: {
        //         id: 'fs-help', 
        //         innerHTML: helpText
        //     },
        //     container: selector
        // });

        const fsw = elementMaker({
            element: 'div', 
            attribs: {
                id: 'fs-widget'
            },
            container: selector
        });

        fs = elementMaker({
            element: 'div', 
            attribs: {
                id: 'fs', 
                'class': 'fs'
            },
            container: fsw
        });

        const sw = elementMaker({
            element: 'div',
            attribs: {
                'class': 'switch resource regular pill green',
                'aria-label': 'toggle resource',
                'data-pop': 'right',
                'data-pop-no-shadow': true,
                'data-pop-arrow': true
            },
            container: fs
        });

        elementMaker({
            element: 'input',
            attribs: {
                type: 'radio',
                id: 'switchResource-3',
                name: 'resource',
                value: 'images',
                'class': 'query',
                autocomplete: 'off',
            },
            container: sw
        });

        elementMaker({
            element: 'label',
            attribs: {
                "for": 'switchResource-3'
            },
            container: sw
        });

        elementMaker({
            element: 'input',
            attribs: {
                type: 'radio',
                id: 'switchResource-4',
                name: 'resource',
                value: 'treatments',
                'class': 'query',
                autocomplete: 'off',
            },
            container: sw
        });

        elementMaker({
            element: 'label',
            attribs: {
                "for": 'switchResource-4'
            },
            container: sw
        });

        let fsb = elementMaker({
            element: 'button', 
            attribs: {
                id: 'fs-go', 
                type: 'submit', 
                'class': 'fs-button-primary', 
                innerText: 'go'
            },
            container: fsw
        });

        fsb.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
    
            result(resultCb);
        });

        makeFsKvElements();
    };

    const makeFsKvElements = function() {

        /**
         * A div to hold the empty param
         */
        const fsp = elementMaker({
            element: 'div', 
            attribs: {
                'class': 'fs-param-empty'
            },
            container: fs
        });
    
        /**
         * A div to hold the param key
         */
        elementMaker({
            element: 'div', 
            attribs: {
                'class': 'fs-key fs-off'
            },
            container: fsp
        });

        /**
         * An input field for the param key
         */
        const fskInput = elementMaker({
            element: 'input', 
            attribs: {
                'class': 'query fs-key-input',
                placeholder: 'choose a key…'
            },
            container: fsp
        });
    
        /**
         * A div for the param val
         */
        elementMaker({
            element: 'div', 
            attribs: {
                'class': 'fs-val fs-off'
            },
            container: fsp
        });

        /**
         * An input field for the param val
         */
        const fsvInput = elementMaker({
            element: 'input', 
            attribs: {
                'class': 'query fs-val-input fs-off',
                placeholder: 'choose a value…'
            },
            container: fsp
        });
    
        /**
         * The x button container to remove a param
         */
        // const fsc = elementMaker({
        //     element: 'div', 
        //     attribs: {
        //         className: 'fs-cancel fs-off'
        //     },
        //     container: fsp
        // });

        /**
         * The x glyph itself
         */
        // elementMaker({
        //     element: 'div', 
        //     attribs: {
        //         innerHTML: '&#8855;'
        //     },
        //     container: fsc
        // });

        // <button id="clear-q" type="reset" aria-label="refresh cache" data-pop="top" data-pop-no-shadow data-pop-arrow>&#8855;</button>
        const fsc = elementMaker({
            element: 'button',
            attribs: {
                'class': 'fs-cancel fs-off',
                type: 'reset',
                innerHTML: '&#8855;'
            },
            container: fsp
        })
    
        fskInput.addEventListener('keydown', modifyKeyPress);
        fsvInput.addEventListener('keydown', modifyKeyPress);
        fsc.addEventListener('click', removeFsp);

        autoCompleteFacets({
            type: 'key', 
            selector: fskInput, 
            values: facetKeys
        });
        fskInput.focus();
    };

    const modifyKeyPress = function(event) {
        
        const ENTER = 13;
        const BACKSPACE = 8;
        const DEL = 46;
    
        event = event || window.event;
        const keyPressed = event.which || event.keyCode;

        let thisInput = event.target;

        /*
     +----+    +----+     +----+     +----+  +----+
     | 0  |    | 1  |     | 2  |     | 3  |  | 4  |
     +-^--+    +-^--+     +-^--+     +-^--+  +-^--+
       |         |          |          |       |   
+------+---------+----------+----------+-------+--+
|+-----+---++----+----++----+----++----+----++-+-+|
||key div  ||key inp  ||val div  ||val inp  || x ||
|+---------++---------++---------++---------++---+|
+------------------------+------------------------+
                         |                         
                         |                         
                       +-v--+                      
                       |fsp |                      
                       +----+                      
        */
        const fsp = thisInput.parentElement;
        // let fsk = fsp.children[0];
        // let fskInput = fsp.children[1];
        const fsv = fsp.children[2];
        const fsvInput = fsp.children[3];
        const fsc = fsp.children[4];
        
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

                const qs = `div#${fsDiv.id} div.fs-param-filled`;
                const allFsp = document.querySelectorAll(qs);
                const lastFsp = allFsp[allFsp.length - 1];
    
                if (lastFsp) {

                    if (lastFsp.className === 'fs-param-filled') {
                        lastFsp.className = 'fs-param-filled fs-hilite';
                    }
                    else if (lastFsp.className = 'fs-param-filled fs-hilite') {
                        lastFsp.parentElement.removeChild(lastFsp);
                    }

                }
                else {
                    const qs = `div#${fsDiv.id} div.fs-param-empty`;
                    const allFsp = document.querySelectorAll(qs);
                    const lastFsp = allFsp[allFsp.length - 1];

                    lastFsp.parentElement.removeChild(lastFsp);
                }
                
            }
        }
    };
    
    const removeFsp = function(event) {
        const that = this.parentElement;
        that.parentElement.removeChild(that);
    };

    const autoCompleteFacets = function({ type, selector, values }) {
        
        new autoComplete({
            selector,

            /**
             * 
             * 'term' refers to the value currently in the text input.
             * 'response' callback, which expects a single argument: the data 
             *      to suggest to the user. This data must be an array of 
             *      filtered suggestions based on the provided term:
             *      ['suggestion 1', 'suggestion 2', 'suggestion 3', ...]
             * 
             */
            source: async function(term, suggest) {
                
                let matches = [];

                if (typeof(values) === 'function') {
                    matches = values();
                }
                else if (typeof(values) === 'object' && values.url) {
                    const response = await fetch(`${values.url}${term}`);

                    if (!response.ok) {
                        throw Error("HTTP-Error: " + response.status)
                    }

                    matches = await values.cb(response);
                }
                else if (Array.isArray(values)) {
                    // let i = 0;
                    // const j = values.length;
        
                    // for (; i < j; i++) {

                    //     const t = values[i];

                    //     if (~t.toLowerCase().indexOf(term.toLowerCase())) {
                    //         matches.push(t);
                    //     }

                    // }
                    matches = values;
                }

                if (matches.length) suggest(matches);
            },

            minChars: Array.isArray(values) ? 0 : 3,
            delay: 150,

            /**
             * A callback function that fires when a suggestion is selected by 
             * mouse click, enter, or tab. event is the event that triggered 
             * the callback, term is the selected value. and item is the item 
             * rendered by the renderItem function.
             */
            onSelect: function(event, term, item) {
    
                const thisInput = this.selector;
                const fsp = thisInput.parentElement;
                
                if (type === 'key') {
                    const fsk = fsp.children[0];
                    fsk.innerText = thisInput.value;
                    fsk.className = 'fs-key fs-on';
                    thisInput.className = 'fs-off';
    
                    const thisFacet = facets.filter(f => f.key === term)[0];

                    /**
                     * remove the key from the facets if 
                     * no duplicates are allowed
                     */
                    if (thisFacet.noDuplicates) {
                        facetKeys.splice(facetKeys.indexOf(term), 1);
                    }
    
                    const nextInput = fsp.children[3];
                    nextInput.className = 'fs-val-input fs-on';
                    nextInput.placeholder = thisFacet.prompt;
                    
                    autoCompleteFacets({
                        type: 'val', 
                        selector: nextInput, 
                        values: thisFacet.values
                    });

                    nextInput.focus();
                }
                else if (type === 'val') {
                    //fsHelp.innerHTML = helpText;
    
                    const fsv = fsp.children[2];
                    
                    if (term) {
                        fsv.innerText = thisInput.value;
                        fsv.className = 'fs-val fs-on';
                    }
                    
                    thisInput.className = 'fs-off';
                    fsp.className = 'fs-param-filled';
                    fsp.children[4].className = 'fs-cancel fs-on';

                    makeFsKvElements();
                }
            }
        });
    };

    /**
     * Package content of fs into a JSON object
     * @param {*} cb 
     */
    const result = function(cb) {
        
        const params = fs.childNodes;
        let q = {};
        let i = 0;
        const j = params.length;

        for (; i < j; i++) {
            const kv = params[i].children;
    
            // https://stackoverflow.com/questions/952924/javascript-chop-slice-trim-off-last-character-in-string
            const key = kv[1].value;

            if (key) {

                const val = kv[3].value.replace(/\n$/, '');
                const actualKey = facets.filter(f => f.key === key)[0].actualKey;
        
                if (actualKey && val) {

                    if (actualKey in q) {
    
                        if (typeof(q[actualKey]) === 'string') {
                            const str = q[actualKey];
                            q[actualKey] = [ str, val ];
                        }
                        else {
                            q[actualKey].push(val);
                        }
    
                    }
                    else {
                        q[actualKey] = val;
                    }
                    
                }

            }
            
        }
        
        cb(q);
    };

    makeFsContainer(selector, helpText);
};

export { fancySearch }