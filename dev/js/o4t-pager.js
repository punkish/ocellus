'use strict';

const PAGER_LENGTH = 9;
const SEP = '•••';
const SEPPOS1 = 2;
const SEPPOS2 = 6;

const range = (i, size, total) => {
    const from = (i * size) + 1;
    let to = from + size - 1;
    if (to >= total) to = total;

    return [ from, to ];
}

const _pager = ({total, subtotal, queryString, page, size, fp, fs, resource, subresource, htmlElement}) => {
    page = parseInt(page)
    size = parseInt(size)
    fp = parseInt(fp)
    fs = parseInt(fs)

    const pager_length = Math.ceil(total / (size || SIZE))
    const page_list = []

    if (pager_length <= PAGER_LENGTH) {

        for (let i = 0; i < pager_length; i++) {

            const [ from, to ] = range(i, size, total)
            const cp = i + 1

            let isCp = false
            if (resource === 'treatments') {
                if (cp === page) {
                    isCp = true
                }
            }
            else if (resource === 'figures') {
                if (cp === fp) {
                    isCp = true
                }
            }

            page_list.push({
                cp: isCp,
                page: cp,
                page_link: resource === 'treatments' ? cp : page,
                size,
                fp: resource === 'treatments' ? fp : cp,
                fs,
                from,
                to,
                sep1: false,
                sep2: false
            })
        }
    }
    else {

        // page 1-5	    1	2	3	4	5	6	…	22	23
        // page 6	    1	2	…	5	6	7	…	22	23
        // page 7	    1	2	…	6	7	8	…	22	23
        // page 8	    1	2	…	7	8	9	…	22	23
        // page 9	    1	2	…	8	9	10	…	22	23
        // page 10	    1	2	…	9	10	11	…	22	23
        // page 11	    1	2	…	10	11	12	…	22	23
        // page 12	    1	2	…	11	12	13	…	22	23
        // page 13	    1	2	…	12	13	14	…	22	23
        // page 14	    1	2	…	13	14	15	…	22	23
        // page 15	    1	2	…	14	15	16	…	22	23
        // page 16	    1	2	…	15	16	17	…	22	23
        // page 17	    1	2	…	16	17	18	…	22	23
        // page 18	    1	2	…	17	18	19	…	22	23
        // page 19-23	1	2	…	18	19	20	21	22	23

        for (let i = 0; i < pager_length; i++) {

            const [ from, to ] = range(i, size, total)
            const cp = i + 1
            
            let isCp = false
            if (resource === 'treatments') {
                if (cp === page) {
                    isCp = true
                }
            }
            else if (resource === 'figures') {
                if (cp === fp) {
                    isCp = true
                }
            }

            page_list.push({
                cp: isCp,
                page: cp,
                page_link: resource === 'treatments' ? cp : page,
                size,
                fp: resource === 'treatments' ? fp : cp,
                fs,
                from,
                to,
                sep1: false,
                sep2: false
            })
        }

        let from
        let num

        const p = resource === 'treatments' ? page : fp

        if (p < SEPPOS2) {
            from = SEPPOS2
            num = (pager_length - 2) - from
            page_list.splice(from, num, { sep2: true })
        }
        
        if (p >= SEPPOS2 && p < (pager_length - 4)) {
            from = SEPPOS1
            num = p - 4
            page_list.splice(from, num, { sep1: true })

            from = SEPPOS2
            num = (pager_length - 9) - (p - from)
            page_list.splice(from, num, { sep2: true })
        }
    
        if (p >= (pager_length - 4)) {
            from = SEPPOS1
            num = pager_length - 8
            page_list.splice(from, num, { sep1: true })
        }
    }
    
    outputPager({resource, page_list, queryString, page, size, fp, fs, htmlElement})
}

const pager = ({total, subtotal, queryString, page, size, fp, fs, resource, subresource, htmlElement}) => {

    if (resource === 'treatments') {
        outputResult({total, subtotal, page, size, fp, fs, resource, subresource, htmlElement})

        if (total > 0 && subtotal > 0) {
            _pager({total, subtotal, queryString, page, size, fp, fs, resource, subresource, htmlElement});
        }
    }
    else if (resource === 'figures' && (total > 0)) {
        _pager({total, subtotal, queryString, page, size, fp, fs, resource, subresource, htmlElement});

        const sel_pageLinks = htmlElement.querySelectorAll('.pager a')
        sel_pageLinks.forEach(p => {
            p.addEventListener('click', figPageClick)
        })
    }
}

const outputPager = ({ resource, page_list, queryString, page, size, fp, fs, htmlElement }) => {
    
    const url = O.globals.ocellus4tUri
    const queryObj = new URLSearchParams(queryString)
    
    const pager = page_list.map(e => {

        let disp

        if (e.cp) {
            //disp = `<td class="cp"><span class="p">${e.page}</span><span class="range">${e.from}–${e.to}</span></td>`
            // disp = `<div class="cp pager-cell"><span class="p">${e.page}</span><span class="range">${e.from}–${e.to}</span></div>`;
            disp = `<div class="cp pager-cell"><span class="range">${e.from}–${e.to}</span></div>`;
        }
        else {
            if (e.sep1 || e.sep2) {
                //disp = `<td class="sep"><span>${SEP}</span></td>`
                disp = `<div class="sep pager-cell"><span>${SEP}</span></div>`;
            }
            else {
                queryObj.set('page', e.page_link)
                queryObj.set('size', size)
                queryObj.sort()
                const qry = decodeURIComponent(queryObj.toString())

                // disp = `<td class="p"><a href="${url}&$page=${e.page_link}&$size=${size}#fp=${e.fp}&fs=${e.fs}"><span class="p">${e.page}</span><span class="range">${e.from}–${e.to}</span></a></td>`
                //disp = `<td class="p"><a href="?${qry}#fp=${e.fp}&fs=${e.fs}"><span class="p">${e.page}</span><span class="range">${e.from}–${e.to}</span></a></td>`
                // disp = `<div class="p pager-cell"><a href="?${qry}#fp=${e.fp}&fs=${e.fs}"><span class="p">${e.page}</span><span class="range">${e.from}–${e.to}</span></a></div>`;
                disp = `<div class="p pager-cell"><a href="?${qry}#fp=${e.fp}&fs=${e.fs}"><span class="range">${e.from}–${e.to}</span></a></div>`;
            }
        }

        return disp
    })

    if (pager.length < PAGER_LENGTH) {
        for (let i = 0, j = (PAGER_LENGTH - pager.length); i < j; i++) {
            pager.push('<div class="e pager-cell"></div>')
        }
    }

    pager.unshift(`<div class="header pager-cell">${resource}</div>`)

    htmlElement.innerHTML = pager.join('');
}

const outputResult = ({ total, subtotal, page, size, fp, fs, htmlElement, resource, subresource }) => {
    size = parseInt(size)

    let html

    if (total == 0) {
        html = `No treatments found.`
    }
    else {
        html = `Found ${niceNumbers(total)} treatments`

        if (subtotal == 0) {
            html += `, but no related figures found. Please search again.`
        }
        else {
            
            const fromTreatments = ((page - 1) * size) + 1
            const toTreatments = fromTreatments + size - 1

            let n = size
            if (toTreatments > total) n = total - fromTreatments + 1

            if (toTreatments > total) {
                html += `, showing the figures from the last ${niceNumbers(n)} treatments.`
            }
            else {
                html += `, showing the figures from the ${nth(page)} batch of ${niceNumbers(n)} treatments.`
            }
        }
    }
    
    sel_searchResults.innerHTML = html
}

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
    const nice = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    return n < 10 ? nice[n - 1].toLowerCase() : n
}