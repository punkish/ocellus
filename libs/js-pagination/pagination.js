/* Constants */
//RESULTS_PER_PAGE = 10;

//SEARCH_RESULTS = 'searchResults' // ID of element to display search results
//PAGINATE = 'paginate' // ID of element to display pagination results
SEPARATOR = 'ººº'


/**
 * pagination()
 *
 * Returns an array of page numbers between one (1) and a given end number,
 * returning a maximum of 10 numbers, with missing ranges replaced with elipses
 * (which are included in the maximum return count). A 'current page' is
 * supplied, and the current page number is surrounded by the two sequential
 * numbers before and after.
 *
 * The total number of numbers to return is determined by the total number
 * of results to expect divided by the number of results to display per page.
 * This is further affected by the current page displayed. Possible outcomes of
 * the function could look like so:
 *
 * [1, 2, 3, 4, 5, 6, 7, '...', 44, 45]        // 1-7 is the current page
 * [1, 2, 3, '...', 7, 8, 9, 10, 11, 12]       // 2 is the current page
 * [1, 2, '...', 10, 11, 12, '...', 44, 45]    // 8-39 is the current page
 * [1, 2, '...', 33, 34, 35, 36, 37, 38, 39]   // 33-39 is the current page
 *
 * @param {number} total_results (Required: The total number of results to
 *    expect, the end number.)
 *
 * @param {number} start_number (Required: The value/start number of the page 
 *    currently displayed.)
 *
 * @param {number} results_page (Optional: The number of results to show for
 *    each page. Defaults to 10.)
 *
 * @return {array} (An array containing the range numbers.)
 *
 * @throws {TypeError} (If any parameter is not a finite number.)
 * @throws {Error} (If any parameter is not a positive number.)
 *
 * modified from: https://www.freecodecamp.org/news/https-medium-com-gladchinda-hacks-for-creating-javascript-arrays-a1b80cb372b/
 * author: Ammon Shepherd
 * date: August 12, 2019
 */

function pagination(total_results, start_number, results_page = 10) {
    
    const arr = [total_results, results_page, start_number]
    
    // Test that the first 3 arguments are finite numbers.
    // Using Array.prototype.every() and Number.isFinite().
    const allNumbers = arr.every(Number.isFinite);

    // Throw an error if any of the first 3 arguments is not a finite number.
    if (!allNumbers) {
        throw new TypeError('pagination() expects only finite numbers as arguments.');
    }

    // Ensure the step is always a positive number.
    if (total_results <= 0) {
        throw new Error('total_results must be a number greater than 0.');
    }
    if (results_page <= 0) {
        throw new Error('results_page must be a number greater than 0.');
    }
    if (start_number < 0) {
        throw new Error('start_number must be a number greater than or equal to 0.');
    }

    // Determine the length of the array to be returned, which is the total
    // results divided by the number of results per page.
    const length = Math.ceil(Math.abs(total_results / results_page));

    // 10 pages or less, just return the array
    if (length <= PAGER_LENGTH ) {
        // Fill up a new array with the range numbers
        // using Array.from() with a mapping function.
        let full_array = Array.from(Array(length), (x, index) => index + 1);
        return full_array
    }
  
    let current_page = (start_number / results_page) + 1;
    if (start_number == 1){
        current_page = 1;
    }

    let pages = new Array();
    for (i = 1; i <= length; i++) {
        // If the current page is ePos or less, show pages 1-ePos, 
        // then ellipses, then the remaining pages
        if ( (current_page < SEPERATOR_POS) && (i < SEPERATOR_POS) ) {
            pages.push(i);
            continue;
        }

        if ( (i == (SEPERATOR_POS + 1)) && (current_page < (SEPERATOR_POS - 1)) ) {
            pages.push(SEPARATOR)
            continue;
        }


        // if the current page is within six places of the last page, show the
        // last six pages.
        if ( (current_page > length - 5) && (i > length - 5) ) {
            pages.push(i);
            continue;
        }

        if ( (i == length - 6) && (current_page > length - 4) ) {
            pages.push(SEPARATOR);
            continue;
        }


        // Show the first two pages, the current page surrounded by a page and
        // ellispses, then the last two pages
        if (i < 3) {
            pages.push(i);
        } else if (i == current_page - 1) {
            pages.push(SEPARATOR);
            pages.push(i);
        } else if (i == current_page) {
            pages.push(i);
            continue;
        } else if ( (i == current_page + 1) && (current_page < length - 3) ) {
            pages.push(i);
            pages.push(SEPARATOR);
        }

        if ( (i == length - 1) || (i == length) ) {
            pages.push(i);
        }

    }

    return pages;
}

/**
 * buildPagination()
 *
 * Generates and inserts the pagination links into the HTML document. This
 * function should be called when the page is loaded. The function takes the
 * total number of results returned from the search query.
 *
 * @param {number} countOfTreatments (Required: The total number of treatments
 *    returned from the search query.)
 * 
 * @param {number} countOfFigures (Required: The total number of figures
 *    returned from the current page of treatments.)
 * 
 *
 * @throws {Error} (If any parameter is not a positive number.)
 *
 * author: Ammon Shepherd
 * date: August 22, 2019
 */

// function buildPagination(q, countOfFigures, countOfTreatments, page, size, prevPage, nextPage) {
function buildPagination({zenodeoUri, queryString, resource, total, page, size, fp, fs, prevPage, nextPage, htmlElement}) {

    // console.log(`queryStr: ${queryStr}`)
    // console.log(`${resource === 'treatments' ? 't' : 'f'} – page: ${page}, size: ${size}`, `fp: ${fp}, fs: ${fs}`)
    
    const sel_searchResults = htmlElement.querySelector('.search-results')
    const sel_pager = htmlElement.querySelector('.pager')

    if (resource === 'figures') {
        sel_searchResults.innerHTML = ''
        sel_pager.innerHTML = ''
    }

    // If there are no results, just return some text saying that.
    if (total < 1) {
        sel_searchResults.insertAdjacentHTML('afterbegin', `No ${resource} found.`)
        return
    }
    else {

        let msg

        if (total < size) {
            msg = `Showing ${niceNumbers(total)} ${resource}`
        }
        else {
            if (resource === 'treatments') {
                msg = `Found ${niceNumbers(total)} treatments. Showing figures from the ${nth(page)} ${niceNumbers(size)} treatments below.`
            }
            else if (resource === 'figures') {
                msg = `Showing the ${nth(fp)} ${niceNumbers(size)} of ${niceNumbers(total)} ${resource} below.`
            }
        }

        sel_searchResults.insertAdjacentHTML('afterbegin', msg)

    }

    const params = new URLSearchParams(queryString)

    // we need to adjust the page and fp params for each tab in the array
    // page will increase for treatments, and fp will increase for figures
    // size and fs will remain the same for both

    const cp = resource === 'treatments' ? page : fp

    // Generate an array of page numbers, using the pagination function
    const pages_list = pagination(total, parseInt(page), parseInt(size))

    // loop through the array of pages, and construct a link for each page
    // number. The current page number does not become a link. Also create the
    // previous and next links.
    for (let n = 0; n < pages_list.length; n++) {

        // the page number from the array
        const page_num = pages_list[n]

        // if the page number is actually an elipse, just return 
        // an elipse without a link
        if (page_num === SEPARATOR) {
            sel_pager.insertAdjacentHTML('beforeend', `<span class="page-link">${SEPARATOR}</span>`)
        } 
        else {

            const s = resource === 'treatments' ? size : fs

            // from and to are used in the display tabs
            const from = ((page_num - 1) * s) + 1
            let to = parseInt(from) + parseInt(s) - 1
            
            if (to >= total) to = total
            const page_disp = `<span class="page_num">${page_num}</span><span class="page_range">: ${from} → ${to}</span>`

            // start = where the search results should start. 
            // This is the page number (in the array)
            let start = 1

            // if the page number in the array that we are on is the same as
            // the current page (calculated from the start parameter) then this
            // is the current page, 
            if (page_num == cp) {

                // Show the previous link if the current page is greater than 5
                if (cp > 5) {

                    // the start value should be the results per page quantity
                    // less than the current start value
                    if (resource === 'treatments') {
                        //params.set('$page', start)
                        params.set('$page', page_num)
                    }
                    else if (resource === 'figures') {
                        fp = start - 1
                    }
                }

                // Show the next link if the current page is 5 places less than
                // the last one (which you get by getting the value of the last
                // element in the pages_list array) then subtract 5
                if (cp < pages_list[pages_list.length - 1] - 4 ) {

                    // if the current page is 1, then start should be 1
                    if (cp == 1) {
                        start = 1
                    }

                    if (resource === 'treatments') {
                        //params.set('$page', start + n)
                        params.set('$page', page_num)
                    }
                    else if (resource === 'figures') {
                        fp = start + n
                    }
                }

                // Show the current page number, without a link, then skip the
                // rest of the code in the loop and go to the next element in
                // the array
                //sel_pager.insertAdjacentHTML('beforeend', `<span class="page-link current-page-link btn-floating btn-large">${page_disp}</span>`);
                sel_pager.insertAdjacentHTML('beforeend', `<span class="page-link current-page-link">${page_disp}</span>`)
                continue;
            }

            if (resource === 'treatments') {
                //params.set('$page', start + n)
                params.set('$page', page_num)
            }
            else if (resource === 'figures') {
                params.set('$page', start)
                fp = start + n
            }
            
            params.set('$size', size)

            sel_pager.insertAdjacentHTML('beforeend', `<span class="page-link"><a href='${zenodeoUri}?${decodeURIComponent(params.toString())}#fp=${fp}&fs=${fs}'>${page_disp}</a></span>`);
        }


    }

    // link to prev page of treatments
    // if (prev) {
    //     sel_pager.insertAdjacentHTML('afterbegin', `<span class="page-link"><a href='${url.toString()}?${query}&$page=${prev}&$size=${size}#fp=${hash.fp}&fs=${hash.fs}'>prev</a></span>`)
    // }

    // if (next) {
    //     sel_pager.insertAdjacentHTML('beforeend', `<div class="page-link next-link"><a href='${url}?${query}&$page=${next}&$size=${size}#fp=${hash.fp}&fs=${hash.fs}'>next</a></div>`)
    // }

}



