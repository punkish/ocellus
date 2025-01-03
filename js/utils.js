import { $, $$ } from './base.js';
import { getResource, getCountOfResource } from './querier.js';
import { renderYearlyCountsSparkline } from './renderers.js';
// import { renderDashboard } from './renderers-charts.js';
import { globals } from './globals.js';

function formatLog(msg, level) {
    if (level === 1) {
        return `- ${msg}`;
    }
    else if (level === 2) {
        return `  ${msg}`;
    }
    else if (level === 3) {
        return `    ${msg}`;
    }
}

/**
 * convert queryString to form inputs. Right now qs2form() fills 
 * only the normal search form. TODO: be able to fill fancy search
 * form as well.
 */
function qs2form(qs) {
    log.info(formatLog(`qs2form(${qs})`, 1));

    const sp = new URLSearchParams(qs);
    
    // we don't want 'refreshCache' in bookmarked queries
    sp.delete('refreshCache');

    // temp array to store values for input field 'q'
    const q = [];

    sp.forEach((val, key) => {
        log.info(formatLog(`key: "${key}", val: "${val}"`, 3));

        // for keys that won't go into 'q'
        if (globals.params.notValidQ.includes(key)) {

            if (key === 'resource') {
                log.info(formatLog(`setting form to query resource "${val}"`, 3));
                updateSearchPlaceHolder(val);
                const checked = val === 'treatments' ? true : false;
                log.info(formatLog(`setting toggle-resource to "${checked}"`, 3));
                $('input[name=resource]').checked = checked;
            }
            else {
                log.info(formatLog(`setting input name "${key}" to "${val}"`, 3));
                $(`input[name=${key}]`).value = val;
            }

        }

        // all the keys that will go into 'q'
        else {
            log.info(formatLog(`building value of "q"`, 3));

            // default value
            let value = key;

            if (val) {
                value = key === 'q' ? decodeURIComponent(val) : `${key}=${val}`;
            }

            q.push(value);
        }
        
    });

    $('#q').value = q.join('&');
}

// Javascript: Ordinal suffix for numbers
// https://stackoverflow.com/a/15810761
function nth(n) {
    log.info(formatLog(`nth(${n})`, 1));

    if ( isNaN(n) || n % 1 ) return n;

    const s = n % 100;

    if ( s > 3 && s < 21 ) return `${n}th`;

    switch( s % 10 ) {
        case 1:  return `${n}st`;
        case 2:  return `${n}nd`;
        case 3:  return `${n}rd`;
        default: return `${n}th`;
    }
}

function niceNumbers(n) {
    log.info(formatLog(`niceNumbers(${n})`, 1));

    const nice = [
        'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'
    ];

    return n < 10 ? nice[n - 1].toLowerCase() : n
}

function smoke(e) {
    log.info(formatLog(`smoke(${e})`, 1));

    // http://jsfiddle.net/Y7Ek4/22/
    let intervalId = 0

    function animatePoof() {
        log.info(formatLog(`animatePoof()`, 1));

        let bgTop = 0
        let frame = 0
        const frames = 6
        const frameSize = 32
        const frameRate = 80
    
        function animate() {
            log.info(formatLog(`animate()`, 1));

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

    function hide() {
        log.info(formatLog(`hide()`, 1));

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
    const t = e.currentTarget.parentNode.parentNode;
    hidden.push(t);
    // sel_hiddenFigures.innerHTML = ` (${hidden.length} hidden) <a id="hide-unhide" href="#unhide">unhide</a>`
    // document.getElementById('hide-unhide').addEventListener('click', unhide)
    t.style.opacity = 1;

    intervalId = setInterval(hide, 50);
}

// click on [go] button gets query results and renders the page
// 
function submitForm() {
    log.info(formatLog('submitForm()', 1));

    const qs = form2qs();

    if (qs) {
        updateUrl(qs);
        getResource(qs);
    }
    else {
        return false;
    }
}

function updateSearchPlaceHolder(resource) {
    log.info(formatLog(`updateSearchPlaceHolder("${resource}")`, 1));

    $('#q').placeholder = `search ${resource}`;
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
function form2qs() {
    log.info(formatLog('form2qs()', 1));

    const sp = new URLSearchParams();
    //const arr = Array.from($$('form input.query'));
    //const r = / & /g;

    const searchtypeToggle = $('input[name=searchtype');
    const typeOfSearch = searchtypeToggle.checked === true ? 'as' : 'ss';
    let submitFlag = true;

    if (typeOfSearch === 'ss') {
        log.info(formatLog('simple search', 3));

        Array.from($$('form input.query')).filter(i => i.value).forEach(i => {
            let key = i.name;
            let val = i.value;

            if (key === 'q') {

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

                    if (i.name === 'resource') {
                        if (i.checked || i.checked === 'true') {
                            sp.append(key, val);
                        }
                        else {
                            sp.append(key, 'images');
                        }
                    }
                    else {
                        if (i.checked || i.checked === 'true') {
                            sp.append(key, val);
                        }
                    }
                    
                }
                else {
                    sp.append(key, val);
                }

            }
        });
    }
    else if (typeOfSearch === 'as') {
        log.info(formatLog('advanced search', 3));

        const commonInputs = [
            'page',
            'size',
            'resource',
            'refreshCache'
        ];

        commonInputs.forEach((fldName) => {
            const fld = $(`input[name=${fldName}]`);

            if (fldName === 'resource') {
                if (fld.checked || fld.checked === 'true') {
                    sp.append(fldName, fld.value);
                }
                else {
                    sp.append(fldName, 'images');
                }
            }
            else {
                if (fld.checked || fld.checked === 'true') {
                    sp.append(fldName, fld.value);
                }
            }
            
        });

        const textInputs = [
            'q',
            'treatmentTitle',
            'authorityName',
            'articleTitle',
            'journalTitle',
            //'journals_id',
            'collectionCode'
        ];

        textInputs.forEach((fldName) => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.value) {
                sp.append(fldName, fld.value);
            }
        });
        
        const checkboxInputs = [
            'status',
            'refreshCache'
        ];

        checkboxInputs.forEach((fldName) => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.checked || fld.checked === 'true') {
                sp.append(fldName, fld.value);
            }
            
        });

        const selectInputs = [
            'journalYear',
            'publicationDate',
            'checkinTime',
            'biome',
            //'biome_id'
        ];

        const processSelectInputs = (fldName) => {
            const op = $(`select[name="as-${fldName}"]`);
            const i = op.selectedIndex;
            const opVal = op.options[i].value;

            if (opVal) {

                if (fldName === 'journalYear') {
                    sp.append(fldName, opVal);
                }
                else if (fldName === 'biome') {
                    sp.append(fldName, opVal);
                }
                else {

                    if (opVal === 'between') {
                        const from = $(`input[name="as-${fldName}From`);
                        const valFrom = from.value;

                        const to = $(`input[name="as-${fldName}To`);
                        const valTo = to.value;

                        if (valFrom && valTo) {
                            sp.append(
                                fldName, 
                                `between(${valFrom} and ${valTo})`
                            );
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
                        console.log(fldName)
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

        for (const i of selectInputs) {
            const res = processSelectInputs(i);

            if (!res) {
                submitFlag = false;
                break;
            }
        }

        const geolocInputs = [
            'geolocation'
        ];

        geolocInputs.forEach(fldName => {
            const fld = $(`input[name="as-${fldName}"]`);

            if (fld.value) {
                sp.append(fldName, fld.value);
            }
        })
        
    }

    if (submitFlag) {
        const qs = sp.toString();
        //console.log(qs)
        return qs;
    }
    else {
        //console.log('false')
        return false;
    }
}

function updateUrl(qs) {
    log.info(formatLog(`updateUrl(${qs})`, 1));

    const state = {};
    const title = '';
    const url = `?${qs}`;
    history.pushState(state, title, url);
}

// Convert milliseconds to days:hours:mins without seconds
// https://stackoverflow.com/a/8528531/183692
function formatTime(ms) {
    log.info(formatLog(`formatTime(${ms})`, 1));

    const ms_in_h = 60 * 60 * 1000;
    const ms_in_d = 24 * ms_in_h;
    let d = Math.floor(ms / ms_in_d);
    let h = Math.floor( (ms - (d * ms_in_d)) / ms_in_h);
    let m = Math.round( (ms - (d * ms_in_d) - (h * ms_in_h)) / 60000);
    const pad = (n) => n < 10 ? '0' + n : n;

    if (m === 60) {
        h++;
        m = 0;
    }

    if (h === 24) {
        d++;
        h = 0;
    }

    return `${d} days ${pad(h)} hours ${pad(m)} mins`;
}

function formatDate(d) {
    log.info(formatLog(`formatDate(${d})`, 1));

    const yyyy = d.getFullYear();
    const mm = d.getMonth();
    const dd = d.getDate();
    const hh = d.getHours();
    const mn = d.getMinutes();
    const ss = d.getSeconds();

    return `${dd} ${globals.months[mm]}, ${yyyy} ${hh}:${mn}:${ss}`;
}

export { 
    nth, 
    niceNumbers, 
    smoke, 
    submitForm, 
    updateSearchPlaceHolder, 
    qs2form,
    form2qs, 
    updateUrl,
    formatTime,
    formatDate
}