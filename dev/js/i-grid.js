import { $, $$ } from './i-utils.js';
import { globals } from './i-globals.js';

const makeFigure = ({ size, treatmentId, title, zenodoRec, uri, caption }) => {
    let type = 'image';
    let treatmentLink = '';

    if (treatmentId) {
        type = 'treatment';
        treatmentLink = `<a href="${globals.tbUri}/${treatmentId}" target="_blank">more on TreatmentBank</a>`;
    }
    
    return `<figure class="figure-${size} ${type}">
    <div class="switches">
        <div class="close"></div>
    </div>
    <picture>
        <img src="/img/bug.gif" width="${size}" data-src="${uri}" class="lazyload" data-recid="${treatmentId}">
    </picture>
    <figcaption>
        <a class="transition-050">Zenodo ID: ${zenodoRec}</a>
        <div class="closed">
            <b class="figTitle">${title}</b><br>
            ${caption}<br>
            <a href="${globals.zenodoUri}/${zenodoRec}" target="_blank">more on Zenodo</a><br>
            ${treatmentLink}
        </div>
    </figcaption>
</figure>`
}

const showPage = (page, size) => {
    const from = (page - 1) * size;
    const to = parseInt(from) + size - 1;
    console.log(from, to)

    const figures = globals.results.figures.slice(from, to);
    $('#grid-images').innerHTML = figures.join('');
    $('#throbber').classList.add('nothrob');
    addListeners();
}

const showSearchCriteria = (queryString, count) => {
    const searchParams = new URLSearchParams(queryString);
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    const from = ((page - 1) * size) + 1;
    const to = parseInt(from) + parseInt(size - 1);

    const criteria = [];
    
    searchParams.delete('page');
    searchParams.delete('size');
    
    searchParams.forEach((v, k) => {
        if (k === 'q') {
            criteria.push(`<span class="crit-key">${v}</span> is in the text`);
        }
        else {
            criteria.push(`<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`);
        }
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

    str = `<span class="crit-count">${count}</span> images found where ${str}… ${from}–${to} shown below`;
    
    $('#search-criteria').innerHTML = str;
}

const showPager = (queryString, prev, next) => {
    $('#pager').innerHTML = `<a href="?q=${queryString}&page=${prev}">prev</a> <a href="?q=${queryString}&page=${next}">next</a>`;
    $('#pager').classList.add('filled');
}

const updateUrl = (queryString) => {
    history.pushState('', null, `?q=${queryString}`);
}

const addListeners = () => {
    const figcaptions = $$('figcaption > a');
    for (let i = 0, j = figcaptions.length; i < j; i++) {
        figcaptions[i].addEventListener('click', toggleFigcaption);
    }
}

const toggleFigcaption = (e) => {
    const figcaptions = $$('figcaption');
    
    // first, close all figcaptions 
    for (let i = 0, j = figcaptions.length; i < j; i++) {
        figcaptions[i].querySelector('div').classList.remove('open');
        figcaptions[i].querySelector('div').classList.add('closed');
    }

    // now open the clicked figcaption
    const fc = e.target.parentElement;
    fc.querySelector('div').classList.remove('closed');
    fc.querySelector('div').classList.add('open');
}

export { makeFigure, showPage, showSearchCriteria, showPager, updateUrl, addListeners }