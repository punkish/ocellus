import { $, $$ } from './utils.js';
import { globals } from './globals.js';
import { 
    addListenersToFigcaptions, 
    addListenersToFigureTypes, 
    addListenersToPagerLinks 
} from './listeners.js';

const makeTreatment = ({ figureSize, rec }) => {
    let zenodoRec = '';
    let zenodoLink = '';

    if (rec.zenodoRec) {
        zenodoRec = `<a class="transition-050">Zenodo ID: ${rec.zenodoRec}</a>`;
        zenodoLink = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a><br>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    return `<figure class="${figureClass}">
    <p class="articleTitle">${rec.articleTitle}</p>
    <p class="treatmentDOI">${rec.treatmentDOI}</p>
    <p class="articleAuthor">${rec.articleAuthor}</p>
    <figcaption class="${figcaptionClass}">
        ${zenodoRec}
        <div>
            <b class="figTitle">${rec.title}</b><br>
            ${zenodoLink}
            <a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>
        </div>
    </figcaption>
</figure>`
}

const makeImage = ({ figureSize, rec }) => {
    const img = `<img src="img/bug.gif" width="${rec.figureSize}" data-src="${rec.uri}" class="lazyload" data-recid="${rec.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${rec.uri}' }, 1000);">`

    const zenodoLink = rec.zenodoRec
        ? `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">more on Zenodo</a><br></br>`
        : '';

    let treatmentReveal = '';
    let treatmentLink = '';

    if (rec.treatmentId) {
        treatmentReveal = `<div class="treatmentId reveal" data-reveal="${rec.treatmentId}">T</div>`;
        treatmentLink = `<a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>`;
    }

    let content = '';

    if (treatmentLink) {
        content = `<a href="${globals.tbUri}/${rec.treatmentId}" target="_blank">${img}</a>`;
    }
    else if (zenodoLink) {
        content = `<a href="${globals.zenodoUri}/${rec.zenodoRec}" target="_blank">${img}</a>`;
    }

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize} ` + (rec.treatmentId 
        ? 'tb' 
        : '');

    return `<figure class="${figureClass}">
    <div class="switches">
        ${treatmentReveal}
        <div class="close"></div>
    </div>
    ${content}
    <figcaption class="${figcaptionClass}">
        <a class="transition-050">Zenodo ID: ${rec.zenodoRec}</a>
        <div class="closed">
            <b class="figTitle">${rec.title}</b><br>
            ${rec.caption}<br>
            ${zenodoLink}
            ${treatmentLink}
        </div>
    </figcaption>
</figure>`
}

const makeFigure = ({ resource, figureSize, rec }) => {
    const obj = { figureSize, rec };
    return resource === 'images'
        ? makeImage(obj)
        : makeTreatment(obj);
}

const renderPage = ({ figureSize, figures, qs, count, prev, next, cacheHit }) => {
    log.info(`- renderPage()
    - figureSize: ${figureSize}px
    - figures: ${figures.length} figures
    - qs: ${qs}
    - count: ${count}
    - prev: ${prev}
    - next: ${next}`);

    $('#grid-images').classList.add(`columns-${figureSize}`);

    renderFigures(figures, qs, prev, next);
    renderSearchCriteria(qs, count, cacheHit);
    $('#throbber').classList.add('nothrob');
}

const renderFigures = (figures, qs, prev, next) => {
    log.info('- renderFigures()');

    if (figures.length) {
        $('#grid-images').innerHTML = figures.join('');
        renderPager(qs, prev, next);
        addListenersToFigcaptions();
        addListenersToFigureTypes();
    }
    // else {
    //     $('#grid-images').innerHTML = '<p class="nada">sorry, no images found</p>';
    // }
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

const renderSearchCriteria = (qs, count, cacheHit) => {
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
    globals.notInSearchCriteria.forEach(p => searchParams.delete(p));
    
    searchParams.forEach((v, k) => {
        let c;

        if (k === 'q') {
            c = `<span class="crit-key">${v}</span> is in the text`;
        }
        else if (k === 'keywords') {
            c = `<span class="crit-key">keyword</span> is <span class="crit-val">${v}</span>`;
        }
        else {
            c = `<span class="crit-key">${k}</span> is <span class="crit-val">${v}</span>`;
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
    str += cacheHit ? '<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>' : '';
    
    $('#search-criteria').innerHTML = str;
}

export {
    makeFigure,
    renderPage,
    renderFigures,
    renderTreatments,
    renderPager,
    renderSearchCriteria
}