/**
 * Renders individual figure (image or treatment) elements
 * as `<figure>` HTML. Each figure may be standalone or wrapped in
 * a carousel with an optional mini-map.
 *
 * Changes from the original:
 *  - Dead `target` parameter removed from makeImage() — it was
 *    never passed by callers (only in renderers.js as
 *    makeImage({figureSize, rec})) and the 'slidebar' branch
 *    was unreachable
 *  - Dead code removed: retryGetImage and resizeBox variables
 *    were computed then immediately overwritten with empty strings,
 *    so they served no purpose and have been deleted
 */

import { globals } from './globals.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Constructs external links (Zenodo, TreatmentBank)
 * that appear in the figure caption, along with CSS classes
 * for layout.
 *
 * @param {{ figureSize: number, rec: Object, resource: string }} opts
 * @returns {{ zenodoLink: string, treatmentLink: string,
 *             figcaptionClass: string, figureClass: string }}
 */
function makeLinks({ figureSize, rec, resource }) {

    const zenodoLink = rec.zenodoDep
        ? `<img src="img/zenodo-gradient-35.png" `
        + `width="35" height="14"> `
        + `<a href="${window.Ocellus.uris.zenodo}`
        + `/records/${rec.zenodoDep}" target="_blank">`
        + `more on Zenodo</a>`
        : '';

    const treatmentLink = `<img src="img/treatmentBankLogo.png" `
        + `width="35" height="14"> `
        + `<a href="${window.Ocellus.uris.treatmentBank}`
        + `/${rec.treatmentId}" target="_blank">`
        + `more on TreatmentBank</a>`;

    // Only show full caption when normal figure size
    // (250px); hide it for smaller sizes (100px, 50px) to save
    // space in the photogrid
    const figcaptionClass =
        figureSize === 250 ? 'visible' : 'noblock';

    const figureClass = `figure-${figureSize} `
        + (resource === 'treatment' ? 'tb' : 'img');

    return {
        zenodoLink,
        treatmentLink,
        figcaptionClass,
        figureClass
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders a treatment record as a `<figure>` element
 * containing the treatment title, citation metadata, and links to
 * external resources.
 *
 * @param {{ figureSize: number, rec: Object }} opts
 * @returns {string} HTML `<figure>` element
 */
const makeTreatment = ({ figureSize, rec }) => {

    const {
        zenodoLink,
        treatmentLink,
        figcaptionClass,
        figureClass
    } = makeLinks({ figureSize, rec, resource: 'treatment' });

    const treatmentDOI = rec.treatmentDOI
        ? `<a href="https://dx.doi.org/${rec.treatmentDOI}">`
        + `${rec.treatmentDOI}</a>`
        : '';

    let citation = '';

    if (rec.articleTitle) {
        citation += `<span class="articleTitle">`
            + `${rec.articleTitle}</span>`;
    }

    if (rec.articleAuthor) {
        citation += ` by <span class="articleAuthor">`
            + `${rec.articleAuthor}</span>`;
    }

    if (rec.journalTitle) {
        citation += ` in <span class="journalTitle">`
            + `${rec.journalTitle}</span>`;
    }

    if (treatmentDOI) {
        citation += `. ${treatmentDOI}`;
    }

    return `<figure class="${figureClass}">
    <p class="treatmentTitle">${rec.treatmentTitle}</p>
    <p class="citation">${citation}</p>
    <figcaption class="${figcaptionClass}">
        <div>
            ${treatmentLink}<br>
            ${zenodoLink}
        </div>
    </figcaption>
</figure>`;
};

/**
 * Renders an image record as a `<figure>` element with
 * a lazy-loaded <img>, fallback for network errors, and optional
 * caption details. Uses SimpleLightbox for image expansion.
 *
 * The dead `target` parameter that was in the original has been
 * removed — it was never passed by makeSlider() in renderers.js.
 *
 * @param {{ figureSize: number, rec: Object }} opts
 * @returns {string} HTML `<figure>` element with lazy-loaded img
 */
const makeImage = ({ figureSize, rec }) => {

    const {
        zenodoLink,
        treatmentLink,
        figcaptionClass,
        figureClass
    } = makeLinks({ figureSize, rec, resource: 'image' });

    const figcaptionContent = `
        <details>
            <summary class="figTitle" `
            + `data-title="${rec.treatmentTitle}">
                ${rec.treatmentTitle}
            </summary>
            <p>${rec.captionText}</p>
            ${treatmentLink}<br>
            ${zenodoLink}
        </details>
        `;

    let img = rec.uri;
    let fullImage = rec.fullImage;

    if (globals.mode === 'airgapped') {
        img = 'img/i250.jpg';
        fullImage = 'img/i250.jpg';
    }

    return `
    <figure class="${figureClass}">
        <a class="zen" href="${fullImage}"><img src="img/bug.gif"
            width="${rec.figureSize}"
            data-src="${img}"
            class="lazyload"
            data-recid="${rec.treatmentId}"></a>
        <figcaption class="${figcaptionClass}">
            ${figcaptionContent}
        </figcaption>
    </figure>
`;
};

export { makeImage, makeTreatment };
