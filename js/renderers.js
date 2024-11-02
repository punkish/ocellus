import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { renderYearlyCounts } from './renderers-charts.js';
import { renderTermFreq } from './renderer-termFreq.js';
import { niceNumbers, qs2form, formatDate, formatTime } from './utils.js';
import { 
    //addListenersToFigcaptions, 
    addListenersToFigDetails,
    addListenersToFigureTypes, 
    addListenersToPagerLinks,
    addListenersToMapCarouselLink,
    toggleAdvSearch,
    lightUpTheBox
} from './listeners.js';
import { makeImage, makeTreatment } from './render-figures.js';
import { getResource, getCountOfResource } from './querier.js';

function makeSlider({ resource, figureSize, rec }) {
    const figure = resource === 'images'
        ? makeImage({ figureSize, rec })
        : makeTreatment({ figureSize, rec });

    const uniqId = resource === 'images'
        ? `${rec.treatments_id}-${rec.images_id}`
        : rec.treatments_id;

    if (rec.loc || rec.convexHull) {
        return `
        <div class="carouselbox">

            <div class="buttons">
                <button class="prev">
                    ◀ <span class="offscreen">Previous</span>
                </button>
                <button class="next" 
                    data-loc=${JSON.stringify(rec.loc)} 
                    data-convexhull=${JSON.stringify(rec.convexHull)} 
                    data-id="${uniqId}">
                    <span class="offscreen">Next</span> ▶︎
                </button>
            </div> 

            <div class="content">
                <div class="slide">
                    ${figure}
                </div>
                <div id="map-${uniqId}" class="map slide"></div>
            </div>
        </div>`
    }
    else {
        return `
        <div class="slidr">
            ${figure}
        </div>`
    }
    
}

const renderPage = ({
    resource, 
    figureSize, 
    slides, 
    qs, 
    count, 
    term, 
    termFreq, 
    yearlyCounts, 
    prev, 
    next, 
    stored, 
    ttl, 
    cacheHit 
}) => {

    log.info(`- renderPage()
    - figureSize: ${figureSize}px
    - figures: ${slides.length} slides
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderSlides(slides, qs, prev, next);
    renderPager(qs, prev, next);
    $('#throbber').classList.add('nothrob');

    if (globals.charts.termFreq) {
        globals.charts.termFreq.dispose();
        $('#termFreq').style.visibility = 'hidden';
    }

    // draw the termFreq chart *only* if values exists
    if (termFreq && termFreq.length) {
        renderTermFreq(term, termFreq);
        $('#termFreq').style.visibility = 'visible';
    }

    renderSearchCriteria(
        qs, count, stored, ttl, cacheHit
    );

    if (globals.charts.yearlyCounts) {
        globals.charts.yearlyCounts.dispose();
        $('#yearlyCounts').style.visibility = 'hidden';
    }

    if (yearlyCounts) {
        renderYearlyCounts({ 
            yearlyCounts: yearlyCounts.yearlyCounts, 
            totals: yearlyCounts.totals
        });

        $('#yearlyCounts').style.visibility = 'visible';
    }

    if (termFreq || yearlyCounts) {
        $('#charts').style.visibility = 'visible';
    }
    
    // hide advanced search panel
    const advSearchIsActive = $('input[name=searchtype]').checked;
    
    if (advSearchIsActive) {
        $('input[name=searchtype]').checked = false;
        toggleAdvSearch();
        qs2form(qs);
    }

    if (resource === 'images') {
        lightUpTheBox();
    }
    
}

const renderSlides = (slides, qs, prev, next) => {
    log.info('- renderSlides()');

    if (slides.length) {
        $('#grid-images').innerHTML = slides.join('');
        // renderPager(qs, prev, next);
        addListenersToFigDetails();
        addListenersToFigureTypes();
        addListenersToMapCarouselLink();
    }
    else {

        // if nothing is found, remove previous search results 
        $('#grid-images').innerHTML = '';
    }
}

const renderPager = (qs, prev, next) => {
    log.info('- renderPager()');
    log.info(`  - qs: ${qs}`);
    log.info(`  - prev: ${prev}`);
    log.info(`  - next: ${next}`);

    const sp = new URLSearchParams(qs);
    sp.delete('page');

    $('#pager').innerHTML = `<a href="?${sp.toString()}&page=${prev}">prev</a> <a href="?${sp.toString()}&page=${next}">next</a>`;
    $('#pager').classList.add('filled');
    addListenersToPagerLinks();
}

// Regex to split camel case
// https://stackoverflow.com/a/54112355/183692
function SplitCamelCaseWithAbbreviations(s){
    return s.split(/([A-Z][a-z]+)/).filter(function(e){return e}).map(e => e.toLowerCase()).join(' ');
 }

function renderSearchCriteria(qs, count, stored, ttl, cacheHit) {
    log.info('- renderSearchCriteria()');

    // object = ${count} ${resource}s
    // ser    = was|were || has|have
    // estar  = checked in|published|updated

    // dates only
    // ----------
    // eq     : ${q} was|were (checked in|published|updated) on ${d}
    // until  : ${q} was|were (checked in|published|updated) until ${d}
    // since  : ${q} has|have been (checked in|published|updated) since ${d}
    // between: ${q} was|were (checked in|published|updated) between ${f} and ${t}

    // fts only
    // --------
    // ${c} ${r}s found with ${term} in text

    // other
    // -----
    // ${c} ${r}s found where ${key} is ${val}

    // dates and fts
    // ${q} was|were (checked in|published|updated) on ${d} with ${term} in text
    
    // First we process count and resource
    const searchParams = new URLSearchParams(qs);
    let resource = searchParams.get('resource');

    // String for search criteria
    const str = [];
    const dateCriteria = [];
    const nonDateCriteria = [];
    globals.params.notValidSearchCriteria.forEach(p => searchParams.delete(p));
    const tag1o = '<span class="crit-key">';
    const tag2o = '<span class="crit-val">';
    const tag3o = '<span class="crit-count">';
    const tagc  = '</span>';
    let criterionIsDate = false;
    const dateKeys = {
        checkinTime    : 'checked in', 
        updateTime     : 'updated', 
        publicationDate: 'published'
    };

    if (!count) {
        count = 'Sorry, no';
    }
    else if (count < 10) {
        count = niceNumbers(count);
    }

    str.push(`${tag3o}${count}${tagc}`);

    if (count === 1) {

        // Singularize resource converting 'treatments' to 'treatment' and 
        // 'images' to 'image'
        resource = resource.slice(0, -1);
    }

    str.push(resource);

    searchParams.forEach((v, k) => {
        let criterion;

        if (Object.keys(dateKeys).includes(k)) {
            criterionIsDate = true;
            const match = v.match(/(?<operator1>eq|since|until)?\((?<date>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)|(?<operator2>between)?\((?<from>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\s*and\s*(?<to>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)/);

            if (match) {
                
                criterion = `${tag1o}${dateKeys[k]}${tagc}`;

                if (match.groups.operator1) {

                    let verb;

                    if (match.groups.operator1 === 'since') {
                        verb = count === 1 ? 'has been' : 'have been';
                    }
                    else {
                        verb = count === 1 ? 'was' : 'were';
                    }

                    str.push(verb);

                    if (match.groups.operator1 === 'eq') {
                        criterion += ' on';
                    }
                    else {
                        criterion += ` ${match.groups.operator1}`;
                    }

                    criterion += ` ${tag2o}${match.groups.date}${tagc}`;
                }
                else if (match.groups.operator2) {
                    criterion += ` ${tag2o}between${tagc} ${tag2o}${match.groups.from}${tagc} and ${tag2o}${match.groups.to}${tagc}`;
                }

                dateCriteria.push(criterion);
            }
        }
        else {
            criterionIsDate = false;
            const match = v.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);
            
            if (match) {
                const { operator, term } = match.groups;
                
                criterion = `${tag1o}${k}${tagc}${operator.replace(/_/,' ')} ${tag2o}${term}${tagc}`;
            }
            else {
                if (k === 'q') {
                    criterion = `${tag1o}${v}${tagc} is in the text`;
                }
                else if (k === 'captionText') {
                    criterion = `${tag1o}${v}${tagc} is in ${tag1o}caption text${tagc}`;
                }
                else if (k === 'geolocation') {
                    const pattern = `(?<operator>within)\\((radius:\s*(?<radius>([+-]?([0-9]+)(.[0-9]+)?)),\s*units:\s*['"](?<units>kilometers|miles)['"],\s*lat:\s*(?<lat>([+-]?([0-9]+)(.[0-9]+)?)),\s*lng:\s*(?<lng>([+-]?([0-9]+)(.[0-9]+)?))|min_lat:\s*(?<min_lat>([+-]?([0-9]+)(.[0-9]+)?)),min_lng:\s*(?<min_lng>([+-]?([0-9]+)(.[0-9]+)?)),max_lat:\s*(?<max_lat>([+-]?([0-9]+)(.[0-9]+)?)),max_lng:\s*(?<max_lng>([+-]?([0-9]+)(.[0-9]+)?)))\\)`;
                    const re = new RegExp(pattern);
                    const m = v.match(re);
                    
                    if (m) {
                        let { operator, radius, units, lat, lng, min_lat, min_lng, max_lat, max_lng } = m.groups;
                        
                        if (radius) {
                            lng = Number(lng).toFixed(2);
                            lat = Number(lat).toFixed(2);

                            criterion = `${tag1o}location${tagc} is within ${tag2o}${radius}${tagc} ${tag2o}${units}${tagc} of ${tag2o}lat ${lat}${tagc} and ${tag2o}lng ${lng}${tagc}`;
                        }
                        else {
                            min_lng = Number(min_lng).toFixed(2);
                            min_lat = Number(min_lat).toFixed(2);
                            max_lng = Number(max_lng).toFixed(2);
                            max_lat = Number(max_lat).toFixed(2);
                            
                            criterion = `${tag1o}location${tagc} is within a box with ${tag1o}lower left corner${tagc} at ${tag2o}lat ${min_lat}, lng ${min_lng}${tagc} and ${tag1o}upper right corner${tagc} at ${tag2o}lat ${max_lat}, lng ${max_lng}${tagc}`;
                        }
                    }
                    
                }
                else {
                    k = SplitCamelCaseWithAbbreviations(k);
                    criterion  = `${tag1o}${k}${tagc} is ${tag2o}${v}${tagc}`;
                }
            }

            nonDateCriteria.push(criterion);
        }

    });

    const criteria = [];

    if (dateCriteria.length) {
        criteria.push(...dateCriteria);
    }
    else {
        str.push('found');
    }
    
    if (nonDateCriteria.length) {
        str.push('where');
    }

    criteria.push(...nonDateCriteria);

    let criteriaStr;
    const len = criteria.length;

    if (len === 1) {
        criteriaStr = criteria[0];
    }
    else if (len === 2) {
        criteriaStr = `${criteria[0]} and ${criteria[1]}`;
    }
    else {
        criteriaStr = `${criteria.slice(0, len - 2).join(', ')}, and ${criteria[len - 1]}`;
    }

    str.push(criteriaStr);

    if (cacheHit) {
        const storedDate = new Date(stored);
        const expires = new Date(stored + ttl) - new Date();
        str.push(`<span aria-label="cache hit, stored ${formatDate(storedDate)}, expires in ${formatTime(expires)}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`);
    }

    $('details.charts summary').innerHTML = str.join(' ');
    $('#charts-container summary').style.visibility = 'visible';
}

function svgFrag(i, height, sparkHeight, barWidth, tooltipText) {
    return `
    <g class="sparkBar" transform="translate(${i * barWidth},0)">
        <rect width="${barWidth}" height="${height}" 
            y="${sparkHeight - height}"
            onmouseover="showTooltip(evt, '${tooltipText}');"
            onmouseout="hideTooltip();"></rect>
    </g>`;
}

// https://css-tricks.com/how-to-make-charts-with-svg/
async function renderYearlyCountsSparkline(
    resource, 
    validGeo = false, 
    context = 'index'
) {
    const getYearlyCounts = true;
    const yearlyCounts = await getCountOfResource(
        resource, getYearlyCounts, validGeo
    );

    let {
        images,
        treatments,
        species,
        journals  
    } = yearlyCounts.totals;

    const yc = yearlyCounts.yearlyCounts;

    let totalCount = resource === 'images'
        ? images
        : treatments;

    const barWidth = 3;
    const numOfRects = yc.length;
    const sparkWidth = barWidth * numOfRects;
    const sparkHeight = 40;
    //const maxNum = Math.max(...yc);
    const heightRatio = sparkHeight / totalCount;
    //const totalImages = numImg.reduce((partialSum, a) => partialSum + a, 0);

    let svg = `<svg id="svgSpark" version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        xmlns:xlink="http://www.w3.org/1999/xlink" 
        class="sparkChart" 
        height="${sparkHeight}" 
        width="${sparkWidth}" 
        aria-labelledby="title" 
        role="img">`;

    for (let i = 0; i < numOfRects; i++) {
        const year = yc[i].year;
        const count = yc[i][`num_of_${resource}`];
        const tooltipText = `${count} ${resource} from ${year}`;
        const height = count * heightRatio;
        svg += svgFrag(i, height, sparkHeight, barWidth, tooltipText);
    }

    svg += '</svg>';

    const sparkChart = $('#sparkChart');
    sparkChart.innerHTML = svg;
    
    let text = '';

    if (context === 'maps') {
        text = `<span>~${abbrevNum(totalCount)}</span> geocoded ${resource} `;
    }
    else {
        text = `<span>~${abbrevNum(totalCount)}</span> ${resource} `;
    }

    text += (resource === 'images') 
        ? `from <span>~${abbrevNum(treatments)}</span> treatments `
        : `<span>~${abbrevNum(images)}</span> images, `;
        text += `of <span>~${abbrevNum(species)}</span> species in <span>~${abbrevNum(journals)}</span> journals`;

    const sparkText = $('#sparkText');
    sparkText.innerHTML = text;
}

function abbrevNum(num) {
    if (num > 999) {
        num = num < 999999 ? `${Math.round(num / 1000, 0)}K` : `${num}M`;
    }
     
    return num;
}

export {
    makeSlider,
    renderPage,
    renderYearlyCountsSparkline
}