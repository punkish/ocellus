import { $, $$ } from './o-utils.js';
import { globals } from './o-globals.js';
/*
## grid
1. showResult(result)
   1. makeLayout(result)
   2. makeSearchCriteria
   3. makePager
   4. renderPage
   5. addPageListeners
*/

// const makeLayout = (records) => {
//     if (records.length) {
//         const size = 250;
//         const figures = [];

//         for (const r of records) {
//             const figure = makeFigure({
//                 size, 
//                 tn: r.links.thumbs ? r.links.thumbs[size]  : '', 
//                 caption: r.metadata.title, 
//                 recId: r.id
//             });

//             figures.push(figure);
//         }

//         return figures;
//     }
// }

// const makeFigure = ({ size, tn, caption, recId }) => {
//     return `<figure class="figure-${size}">
//     <div class="switches">
//         <div class="close"></div>
//     </div>
//     <picture>
//         <img src="/img/bug.gif" width="${size}" data-src="${tn}" class="lazyload" data-recid="${recId}">
//     </picture>
//     <figcaption>
//         <a class="transition-050">rec ID: ${recId}</a>
//         <div class="desc">
//             ${caption}. 
//             <a class='showTreatment' href='${O.zenodoUri}/record/${recId}'>more</a>
//         </div>
//     </figcaption>
// </figure>`
// }

const makeFigure = ({ size, treatmentId, title, zenodoRec, uri, caption }) => {
    const type = treatmentId ? 'treatment' : 'image';
    return `<figure class="figure-${size} ${type}">
    <div class="switches">
        <div class="close"></div>
    </div>
    <picture>
        <img src="../img/bug.gif" width="${size}" data-src="${uri}" class="lazyload" data-recid="${treatmentId}">
    </picture>
    <figcaption>
        <a class="transition-050">Zenodo ID: ${zenodoRec}</a>
        <div class="desc hidden noblock">
            <b class="figTitle">${title}</b>
            ${caption}. <a href="${O.zenodoUri}/${zenodoRec}">more</a>
        </div>
    </figcaption>
</figure>`
}

const showPage = function(layout) {
    $(`#grid-${globals.view}`).innerHTML = layout.join('');
    $('#throbber').classList.add('nothrob');
    globals.hiddenClasses
        .forEach(c => $(`#${globals.view}`).classList.remove(c));

    addListeners();
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
        figcaptions[i].style.maxHeight = globals.closedFigcaptionHeight;
        figcaptions[i].style.overflow = 'hidden';
    }

    // now open the clicked figcaption
    const fc = e.target.parentElement;
    fc.style.maxHeight = '100%';
    fc.style.overflow = 'auto';
}

export { makeFigure, showPage }