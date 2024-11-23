import { globals } from "./globals.js";

const makeTreatment = ({ figureSize, rec }) => {
    let zenodoDep = '';
    let zenodoLink = '';

    if (rec.zenodoDep) {
        zenodoLink = `<a href="${globals.uri.zenodo}/records/${rec.zenodoDep}" target="_blank" title="more on Zenodo" alt="more on Zenodo"><img class="zenodoLink" src="img/zenodo-gradient-round.svg" width="50"></a>`;
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
        <div>
            ${zenodoLink} <a href="${globals.uri.treatmentBank}/${rec.treatmentId}" target="_blank" title="more on TreatmentBank" alt="more on TreatmentBank"><img class="tbLink" src="img/treatmentBankLogo.png" width="100"></a>
        </div>
    </figcaption>
</figure>`
}

const makeImage = ({ figureSize, rec, target }) => {
    const zenodoLink = rec.zenodoDep
        ? `<img src="img/zenodo-gradient-35.png" width="35" height="14"> <a href="${globals.uri.zenodo}/records/${rec.zenodoDep}" target="_blank">more on Zenodo</a>`
        : '';

    const treatmentLink = `<img src="img/treatmentBankLogo.png" width="35" height="14"> <a href="${globals.uri.treatmentBank}/${rec.treatmentId}" target="_blank">more on TreatmentBank</a>`;

    const figcaptionClass = figureSize === 250 
        ? 'visible' 
        : 'noblock';

    const figureClass = `figure-${figureSize}` + (rec.treatmentId ? ' tb' : '');

    const retryGetImage = `this.onerror=null; setTimeout(() => { this.src='${rec.uri}' }, 1000);`;
    const resizeBox = (rec.loc || rec.convexHull)
        ? `this.parentNode.parentNode.parentNode.parentNode.style.height=this.height+150+'px'`
        : '';

    let figcaptionContent;

    if (target === 'slidebar') {
        figcaptionContent = `
        <h3>${rec.treatmentTitle}</h3>
        <p>${rec.captionText}</p>
        ${treatmentLink}<br>
        ${zenodoLink}
        `;
    }
    else {
        figcaptionContent = `
        <details>
            <summary class="figTitle" data-title="${rec.treatmentTitle}">
                ${rec.treatmentTitle}
            </summary>
            <p>${rec.captionText}</p>
            ${treatmentLink}<br>
            ${zenodoLink}<br>
        </details>
        `;
    }

    return `<figure class="${figureClass}">
    <a class="zen" href="${rec.fullImage}"><img src="img/bug.gif" 
        width="${rec.figureSize}" 
        data-src="${rec.uri}" 
        class="lazyload" 
        data-recid="${rec.treatmentId}" 
        onerror="${retryGetImage}"
        onload="${resizeBox}"></a>
    <figcaption class="${figcaptionClass}">
        ${figcaptionContent}
    </figcaption>
</figure>`;
}

export { makeImage, makeTreatment }