import { $, $$ } from './base.js';
import { getResource, getCountOfResource } from './querier.js';
import { renderYearlyCounts } from './renderers.js';

// Javascript: Ordinal suffix for numbers
// https://stackoverflow.com/a/15810761
const nth = function(n) {
    if ( isNaN(n) || n % 1 ) return n;

    const s = n % 100;

    if ( s > 3 && s < 21 ) return n + 'th';

    switch( s % 10 ) {
        case 1:  return n + 'st';
        case 2:  return n + 'nd';
        case 3:  return n + 'rd';
        default: return n + 'th';
    }
}

const niceNumbers = (n) => {
    const nice = [
        'One', 'Two', 'Three', 'Four', 
        'Five', 'Six', 'Seven', 'Eight', 'Nine'
    ];

    return n < 10 
        ? nice[n - 1].toLowerCase() 
        : n
}

const smoke = function (e) {

    // http://jsfiddle.net/Y7Ek4/22/
    let intervalId = 0

    const animatePoof = function() {
        let bgTop = 0
        let frame = 0
        const frames = 6
        const frameSize = 32
        const frameRate = 80
    
        function animate() {
            if (frame < frames) {
                sel_puff.style.backgroundPosition = "0 "+bgTop+"px"
                bgTop = bgTop - frameSize
                frame++
                setTimeout(animate, frameRate)
            }
        }
        
        animate()
        //setTimeout("sel_puff.style.visibility = 'hidden'", frames * frameRate)
    }

    const hide = function() {
        let opacity = Number(t.style.opacity)
        
        if (opacity > 0) { 
            opacity = opacity - 0.1
            t.style.opacity = opacity 
        }
        else { 
            clearInterval(intervalId)
            t.style.display = 'none'
        }
    }

    const xOffset = 24
    const yOffset = 24
    
    // show #puff
    sel_puff.style.left = e.pageX - xOffset + 'px'
    sel_puff.style.top = e.pageY - yOffset + 'px'
    sel_puff.style.display = 'inline'
    sel_puff.style.visibility = 'visible'
    sel_puff.style.opacity = 1

    // animate the puff
    animatePoof()

    // hide the figure /////////////////////
    // https://stackoverflow.com/a/29168819
    const t = e.currentTarget.parentNode.parentNode
    hidden.push(t)
    // sel_hiddenFigures.innerHTML = ` (${hidden.length} hidden) <a id="hide-unhide" href="#unhide">unhide</a>`
    // document.getElementById('hide-unhide').addEventListener('click', unhide)
    t.style.opacity = 1

    intervalId = setInterval(hide, 50)
}

/**
 * case 2: click on [go] button gets query results and renders the page
 */
const submitForm = () => {
    log.info('submitForm()');
    const qs = form2qs();

    if (qs) {
        updateUrl(qs);
        getResource(qs);
    }
    else {
        return false;
    }
}

const updatePlaceHolder = async (resource) => {
    const yearlyCounts = await getCountOfResource(resource, true);
    const speciesCount = await getCountOfResource('species');
    renderYearlyCounts(resource, yearlyCounts, speciesCount);
}

/**
 * convert form inputs to searchParams. All possible inputs
 * are as follows along with their defaults:
 * 
 * page: 1
 * size: 30
 * resource: images
 * q: <no default>
 * <many others> (see globals.validZenodeo)
 * refreshCache: <no default>
 * go: go
 * 
 */
const form2qs = () => {
    log.info('- form2qs()');

    const sp = new URLSearchParams();
    //const arr = Array.from($$('form input.query'));
    //const r = / & /g;

    const searchtypeToggle = $('input[name=searchtype');
    const typeOfSearch = searchtypeToggle.checked === true
        ? 'as'
        : 'ss';

    let submitFlag = true;

    if (typeOfSearch === 'ss') {
        log.info('- form2qs(): simple search');

        Array.from($$('form input.query'))
        .filter(i => i.value)
        .forEach(i => {
            
            let key = i.name;
            let val = i.value;

            if (i.name === 'q') {

                // see discussion at
                // https://stackoverflow.com/q/77613064/183692
                const formVal = i.value.replaceAll(/ & /g, '%20%26%20');
                const spTmp = new URLSearchParams(formVal);

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
            }
            else {
        
                if ((i.type === 'radio' || i.type === 'checkbox')) {
                    if (i.checked || i.checked === 'true') {
                        sp.append(key, val);
                    }
                }
                else {
                    sp.append(key, val);
                }

            }
        });
    }
    else {
        log.info('- form2qs(): advanced search');

        const processCommonInputs = (fldName) => {
            const fld = $(`input[name=${fldName}]`);

            if (fld.checked || fld.checked === 'true') {
                sp.append(fldName, fld.value);
            }
        }

        const commonInputs = [
            'page',
            'size',
            'resource',
            'refreshCache'
        ];

        commonInputs.forEach(i => processCommonInputs(i));

        const processTextInputs = (fldName) => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.value) {
                sp.append(fldName, fld.value);
            }
        }

        const textInputs = [
            'q',
            'treatmentTitle',
            'authorityName',
            'articleTitle',
            'journalTitle'
        ];

        textInputs.forEach(i => processTextInputs(i));
        
        const processCheckboxIinputs = (fldName) => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.checked || fld.checked === 'true') {
                sp.append(fldName, fld.value);
            }
            
        }

        const checkboxInputs = [
            'status',
            'refreshCache'
        ];

        checkboxInputs.forEach(i => processCheckboxIinputs(i));

        const processSelectInputs = (fldName) => {
            const op = $(`select[name="as-${fldName}"]`);
            const i = op.selectedIndex;
            const opVal = op.options[i].value;

            if (opVal) {

                if (fldName === 'journalYear' || fldName === 'biome') {
                    sp.append(fldName, opVal);
                }
                else {

                    if (opVal === 'between') {
                        const from = $(`input[name="as-${fldName}From`);
                        const valFrom = from.value;

                        const to = $(`input[name="as-${fldName}To`);
                        const valTo = to.value;

                        if (valFrom && valTo) {
                            sp.append(fldName, `between(${valFrom} and ${valTo})`);
                        }
                        else {
                            let submitFlag = true;

                            if (valFrom === '') {
                                from.classList.add('required');
                                submitFlag = false;
                            }

                            if (valTo === '') {
                                to.classList.add('required');
                                submitFlag = false;
                            }

                            if (!submitFlag) {
                                return false;
                            }
                        }
                    }
                    else {
                        const inp = $(`input[name="as-${fldName}From`);
                        const val = inp.value;

                        if (val) {
                            sp.append(fldName, `${opVal}(${val})`);
                        }
                        else {
                            inp.classList.add('required');
                            return false;
                        }
                    }

                }

            }

            return true;
        }

        const selectInputs = [
            'journalYear',
            'publicationDate',
            'checkinTime',
            'biome'
        ];

        for (const i of selectInputs) {
            const res = processSelectInputs(i);

            if (!res) {
                submitFlag = false;
                break;
            }
        }
        
    }

    if (submitFlag) {
        const qs = sp.toString();
        return qs;
    }
    else {
        return false;
    }
}

const updateUrl = (qs) => {
    log.info('- updateUrl(qs)');
    //const qs = sp.toString();
    history.pushState('', null, `?${qs}`);
}

export { 
    nth, niceNumbers, smoke, 
    submitForm, updatePlaceHolder, 
    form2qs, updateUrl 
}