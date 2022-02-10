import {$, $$} from './o-utils.js';
import {globals} from './o-globals.js';

const range = (i, size, total) => {
    const from = (i * size) + 1;
    let to = from + size - 1;
    if (to >= total) to = total;
    return [from, to];
}

const _pager = ({total, queryString, page, size, fpage, fsize, resource}) => {
    page = parseInt(page);
    size = parseInt(size);
    fpage = parseInt(fpage);
    fsize = parseInt(fsize);

    const pager_length = Math.ceil(total / (size || globals.size));
    const page_list = [];

    if (pager_length <= globals.pager_length) {
        for (let i = 0; i < pager_length; i++) {
            const [from, to] = range(i, size, total);
            const cp = i + 1;

            let isCp = false;
            if (resource === 'treatments') {
                if (cp === page) {
                    isCp = true;
                }
            }
            else if (resource === 'figures') {
                if (cp === fpage) {
                    isCp = true
                }
            }

            page_list.push({
                cp: isCp,
                page: cp,
                page_link: resource === 'treatments' ? cp : page,
                size,
                fpage: resource === 'treatments' ? fpage : cp,
                fsize,
                from,
                to,
                sep_position1: '',
                sep_position2: ''
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
            const [from, to] = range(i, size, total);
            const cp = i + 1;
            
            let isCp = false;
            if (resource === 'treatments') {
                if (cp === page) {
                    isCp = true;
                }
            }
            else if (resource === 'figures') {
                if (cp === fpage) {
                    isCp = true;
                }
            }

            page_list.push({
                cp: isCp,
                page: cp,
                page_link: resource === 'treatments' ? cp : page,
                size,
                fpage: resource === 'treatments' ? fpage : cp,
                fsize,
                from,
                to,
                sep_position1: '',
                sep_position2: ''
            })
        }

        let from;
        let num;

        const p = resource === 'treatments' ? page : fpage;

        if (p < globals.sep_position2) {
            from = globals.sep_position2;
            num = (pager_length - 2) - from;
            page_list.splice(from, num, { sep_position2: true });
        }
        
        if (p >= globals.sep_position2 && p < (pager_length - 4)) {
            from = globals.sep_position1;
            num = p - 4;
            page_list.splice(from, num, { sep_position1: true });

            from = globals.sep_position2;
            num = (pager_length - 9) - (p - from);
            page_list.splice(from, num, { sep_position2: true })
        }
    
        if (p >= (pager_length - 4)) {
            from = globals.sep_position1;
            num = pager_length - 8;
            page_list.splice(from, num, { sep_position1: true });
        }
    }
    
    return outputPager({resource, page_list, queryString, page, size, fpage, fsize});
}

const pager = ({total, subtotal, queryString, page, size, fpage, fsize, resource, subresource}) => {
    let row;
    
    if (resource === 'treatments') {
        if (total > 0 && subtotal > 0) {
            row = _pager({total, subtotal, queryString, page, size, fpage, fsize, resource, subresource});
        }
    }
    else if (resource === 'figures' && (total > 0)) {
        row = _pager({total, subtotal, queryString, page, size, fpage, fsize, resource, subresource});
    }

    return row;
}

const outputPager = ({resource, page_list, queryString, page, size}) => {
    const url = O.ocellus4tUri
    const sp = new URLSearchParams(queryString)
    
    const pager = page_list.map(e => {
        let cell;

        if (e.cp) {
            cell = `<span class="current-page">${e.from}–${e.to}</span>`;
        }
        else {
            if (e.sep_position1 || e.sep_position2) {
                cell = `<span class="sep">${globals.sep}</span>`;
            }
            else {
                sp.set('page', e.page_link)
                sp.set('size', size)
                sp.sort()
                const qs = decodeURIComponent(sp.toString())

                cell = `<a href="?${qs}#fpage=${e.fpage}&fsize=${e.fsize}">${e.from}–${e.to}</a>`;
            }
        }

        return cell;
    })

    if (pager.length < globals.pager_length) {
        for (let i = 0, j = (globals.pager_length - pager.length); i < j; i++) {
            pager.push('<span class="empty></span>')
        }
    }

    pager.unshift(`<span class="header">${resource}</span>`);
    return pager;
}

// const outputResult = ({total, subtotal, page, size}) => {
//     size = parseInt(size)
//     let html;

//     if (total == 0) {
//         html = `No treatments found.`;
//     }
//     else {
//         html = `Found ${niceNumbers(total)} treatments`;

//         if (subtotal == 0) {
//             html += `, but no related figures found. Please search again.`;
//         }
//         else {
//             const fromTreatments = ((page - 1) * size) + 1;
//             const toTreatments = fromTreatments + size - 1;

//             let n;
//             let str;

//             if (toTreatments > total) {
//                 n = niceNumbers(total - fromTreatments + 1);
//                 str = `last ${n} treatments.`;
//             }
//             else {
//                 n = niceNumbers(size);
//                 str = `${nth(page)} batch of ${n} treatments.`;
//             }

//             html += `, showing the figures from the ${str}`;
//         }
//     }
    
//     $('#search-results').innerHTML = html
// }

// // Javascript: Ordinal suffix for numbers
// // https://stackoverflow.com/a/15810761
// const nth = function(n) {
//     if ( isNaN(n) || n % 1 ) return n;

//     const s = n % 100;

//     if ( s > 3 && s < 21 ) return n + 'th';

//     switch( s % 10 ) {
//         case 1:  return n + 'st';
//         case 2:  return n + 'nd';
//         case 3:  return n + 'rd';
//         default: return n + 'th';
//     }
// }

// const niceNumbers = (n) => {
//     const nice = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
//     return n < 10 ? nice[n - 1].toLowerCase() : n
// }

export {pager}