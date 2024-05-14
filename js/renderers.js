import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { toggleAdvSearch, showDashboard, toggleModal, lightUpTheBox } from './listeners.js';
import { qs2form } from './main.js';
import { renderYearlyCounts } from './renderers-charts.js';
import { renderTermFreq } from './renderer-termFreq.js';

import { 
    //addListenersToFigcaptions, 
    addListenersToFigDetails,
    addListenersToFigureTypes, 
    addListenersToPagerLinks 
} from './listeners.js';

const makeTreatment = ({ figureSize, rec }) => {
    let zenodoRec = '';
    let zenodoLink = '';

    if (rec.zenodoRec) {
        //zenodoRec = `<a class="transition-050">Zenodo ID: ${rec.zenodoRec}</a>`;
        zenodoLink = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    const treatmentDOI = rec.treatmentDOI
        ? `<a href="https://dx.doi.org/${rec.treatmentDOI}">${rec.treatmentDOI}</a>`
        : '';

    let citation = '';

    if (rec.articleTitle) {
        citation += `<span class="articleTitle">${rec.articleTitle}</span>`;
    }

    if (rec.articleAuthor) {
        citation += ` by <span class="articleAuthor">${rec.articleAuthor}</span>`;
    }

    if (rec.journalTitle) {
        citation += ` in <span class="journalTitle">${rec.journalTitle}</span>`;
    }

    if (treatmentDOI) {
        citation += `. ${treatmentDOI}`;
    }

    return `<figure class="${figureClass}">
    <p class="treatmentTitle">${rec.treatmentTitle}</p>
    <p class="citation">${citation}</p>
    <figcaption class="${figcaptionClass}">
        <!-- ${zenodoRec} -->
        <div>
            ${zenodoLink} <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>
        </div>
    </figcaption>
</figure>`
}

const makeImage = ({ figureSize, rec }) => {
    const zenodoLink = rec.zenodoRec
        ? `<img src="img/zenodo-gradient-35.png" width="35" height="14"> <a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a>`
        : '';

    //let treatmentReveal = '';
    //treatmentReveal = `<div class="treatmentId reveal" data-reveal="${rec.treatmentId}">T</div>`;
    const treatmentLink = `<img src="img/treatmentBankLogo.png" width="35" height="14"> <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>`;

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId ? 'tb' : '');

    // <div class="switches"><div class="close"></div></div>
    const onerrorCb = `this.onerror=null; setTimeout(() => { this.src='${rec.uri}' }, 1000);`;

    return `<figure class="${figureClass}">
    <a class="zen" href="${rec.fullImage}">
        <img src="img/bug.gif" width="${rec.figureSize}" data-src="${rec.uri}" 
            class="lazyload" data-recid="${rec.treatmentId}" 
            onerror="${onerrorCb}">
    </a>
    <figcaption class="${figcaptionClass}">
        <details>
            <summary class="figTitle" data-title="${rec.treatmentTitle}">
                ${rec.treatmentTitle}
            </summary>
            <p>${rec.captionText}</p>
            ${treatmentLink}<br>
            ${zenodoLink}
        </details>
    </figcaption>
</figure>`;
}

const makeFigure = ({ resource, figureSize, rec }) => {
    const obj = { figureSize, rec };
    return resource === 'images'
        ? makeImage(obj)
        : makeTreatment(obj);
}

const renderPage = ({
    resource, 
    figureSize, 
    figures, 
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
    - figures: ${figures.length} figures
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderFigures(figures, qs, prev, next);
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
    
    // retrieve searchCriteria string and cacheHit emoji to be used in the 
    // yearlyCounts chart
    const { searchCriteriaStr, cacheHitExplosion } = renderSearchCriteria(
        qs, count, stored, ttl, cacheHit
    );

    if (globals.charts.yearlyCounts) {
        globals.charts.yearlyCounts.dispose();
        $('#yearlyCounts').style.visibility = 'hidden';
    }

    if (yearlyCounts) {
        renderYearlyCounts({ 
            yearlyCounts: yearlyCounts.yearlyCounts, 
            totals: yearlyCounts.totals,
            searchCriteriaStr,
            cacheHitExplosion
        });
        $('#yearlyCounts').style.visibility = 'visible';
    }

    if (termFreq || yearlyCounts) {
        $('#charts-container summary').style.visibility = 'visible';
        $('#charts').style.visibility = 'visible';
    }
    
    // hide advanced search panel
    const advSearchIsActive = $('input[name=searchtype]').checked;
    
    if (advSearchIsActive) {
        $('input[name=searchtype]').checked = false;
        toggleAdvSearch();
        qs2form(qs);
    }

    lightUpTheBox();
}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
        addListenersToFigDetails();
        addListenersToFigureTypes();
    }
    else {

        // if nothing is found, remove previous search results 
        $('#grid-images').innerHTML = '';
    }
}

const renderTreatments = () => {

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

const renderSearchCriteria = (qs, count, stored, ttl, cacheHit) => {
    log.info('- renderSearchCriteria(qs, count)');
    log.info(`  - qs: ${qs}`);
    log.info(`  - count: ${count}`);

    const searchParams = new URLSearchParams(qs);
    const resource = searchParams.get('resource');
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    const from = ((page - 1) * size) + 1;
    let to = parseInt(from) + parseInt(size - 1);

    if (to > count) {
        to = count;
    }

    if (!count) {
        count = 'sorry, no';
    }

    const criteria = [];
    globals.params.notValidSearchCriteria.forEach(p => searchParams.delete(p));
    
    searchParams.forEach((v, k) => {
        let c;

        const match = v.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);

        if (match) {
            const { operator, term } = match.groups;
            c = `<span class="crit-key">${k}</span> ${operator.replace(/_/,' ')} <span class="crit-val">${term}</span>`;
        }
        else {
            if (k === 'q') {
                c = `<span class="crit-key">${v}</span> is in the text`;
            }
            else {
                c = `<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`;
            }
        }

        criteria.push(c);
    })

    let str;
    const len = criteria.length;

    if (len === 1) {
        str = criteria[0];
    }
    else if (len === 2) {
        str = `${criteria[0]} and ${criteria[1]}`;
    }
    else {
        str = `${criteria.slice(0, len - 2).join(', ')}, and ${criteria[len - 1]}`;
    }

    /*
    **1107** records found where **hake** is in the text… **19** unique images from the first **30** records are shown below.
    **1107** records found where **hake** is in the text… **27** unique images from records **31–60**  are shown below.
    */
    //… <span class="crit-count">${globals.results.figures.length}</span> unique images from records ${from}–${to} are shown below
    //const aboutCount = count - (count % 5);
    str = `<span class="crit-count">${count}</span> ${resource} found where ${str}`;

    let cacheHitExplosion;

    if (cacheHit) {
        const storedDate = new Date(stored);
        const expires = new Date(stored + ttl) - new Date();
        const cacheHitMsg = `cache hit, stored ${formatDate(storedDate)}, expires in ${formatTime(expires)}`;
        cacheHitExplosion = `<span aria-label="${cacheHitMsg}" data-html="true" data-pop="top" data-pop-no-shadow data-pop-arrow data-pop-multiline>💥</span>`;
    }
    
    return { 
        searchCriteriaStr: str, 
        cacheHitExplosion 
    };
}

// Javascript show milliseconds as days:hours:mins without seconds
// https://stackoverflow.com/a/8528531/183692
const formatTime = (t) => {
    const cd = 24 * 60 * 60 * 1000;
    const ch = 60 * 60 * 1000;
    let d = Math.floor(t / cd);
    let h = Math.floor( (t - d * cd) / ch);
    let m = Math.round( (t - d * cd - h * ch) / 60000);
    const pad = (n) => n < 10 ? '0' + n : n;

    if (m === 60){
        h++;
        m = 0;
    }

    if (h === 24) {
        d++;
        h = 0;
    }

    return `${d} days ${pad(h)} hours ${pad(m)} mins`;
}

const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = d.getMonth();
    const dd = d.getDate();
    const hh = d.getHours();
    const mn = d.getMinutes();
    const ss = d.getSeconds();

    return `${dd} ${globals.months[mm]}, ${yyyy} ${hh}:${mn}:${ss}`;
}

// https://css-tricks.com/how-to-make-charts-with-svg/
const renderYearlyCountsSparkline = (resource, yearlyCounts) => {
    const {
        images,
        treatments,
        species,
        journals  
    } = yearlyCounts.totals;

    const yc = yearlyCounts.yearlyCounts;

    const totalCount = resource === 'images'
        ? images
        : treatments;

    const barWidth = 3;
    const className = 'bar';
    const numOfRects = yc.length;
    const sparkWidth = barWidth * numOfRects;
    const sparkHeight = 40;
    const maxNum = Math.max(...yc);
    const heightRatio = sparkHeight / totalCount;
    //const totalImages = numImg.reduce((partialSum, a) => partialSum + a, 0);

    function svgFrag(i, className, height, sparkHeight, barWidth, year, count) {
        return `<g class="${className}" transform="translate(${i * barWidth},0)">
            <rect height="${height}" y="${sparkHeight - height}" width="${barWidth}" onmousemove="showTooltip(evt, '${year}: ${count} ${resource}');" onmouseout="hideTooltip();"></rect>
        </g>`;
    }

    let spark = `<svg id="svgSpark" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart" height="${sparkHeight}" width="${sparkWidth}" aria-labelledby="title" role="img">`;

    for (let i = 0; i < numOfRects; i++) {
        const year = yc[i].year;
        const count = yc[i][`num_of_${resource}`];
        const height = count * heightRatio;
        spark += svgFrag(i, className, height, sparkHeight, barWidth, year, count);
    }

    spark += '</svg>';

    const svg = document.querySelector('#sparkBox');
    let html = spark;
    //html += '<a href="#dashboard" class="modalToggle">';

    if (resource === 'images') {
        html += `<span>~${Math.ceil(totalCount / 1000)}K</span> ${resource}, <span>~${Math.ceil(treatments / 1000)}K</span> treatments, `;
    }
    else {
        html += `<span>~${Math.ceil(totalCount / 1000)}K</span> ${resource}, <span>~${Math.ceil(images / 1000)}K</span> images, `;
    }

    html += `<span>~${Math.ceil(species / 1000)}K</span> species from <span>~${Math.ceil(journals / 1000)}K</span> journals`;

    //html += '</a>';

    svg.innerHTML = html;
}

export {
    makeFigure,
    renderPage,
    renderYearlyCountsSparkline,
    //renderDashboard
    // showTooltip,
    // hideTooltip
}