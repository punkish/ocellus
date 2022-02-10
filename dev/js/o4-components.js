if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

'use strict';

O.components = {
    makeHeader: ({anchor, brand}) => {
        anchor.innerHTML = `<div id="brand">${brand}</div>
            <div class="title">
                <h1>ocellus</h1>
                <small>A Plazi Project</small><br>
                <a href="about.html" class="modal-open">about</a>
            </div>
            
            <form>
                <div class="form-wrapper">
                    <div class="input-wrapper">
                        <input id="q" type="text" placeholder="search for something" class="clearable">
        
                        <span id="refreshCacheWrapper" aria-label="refresh cache" data-pop="top" data-pop-no-shadow data-pop-arrow>
                            <input name="refreshCache" id="refreshCache" type="checkbox" value="true" class="unchecked">
                        </span>
        
                        <!-- <span id="clearQ" class="removeClick" aria-label="clear input" data-pop="top" data-pop-no-shadow data-pop-arrow>&times;</span> -->
                        <span id="clearQ" class="removeClick" aria-label="clear input" data-pop="top" data-pop-no-shadow data-pop-arrow>clear<br>input</span>
                    </div>
                    <button id="go">go</button>
                </div>
                <div id="refreshCache-target" class="hide">This will refresh the cache. You probably don’t want to do this.</div>
            </form>`;

        O.t.sel_q.addEventListener('focus', function() {
            O.t.sel_q.placeholder = 'search for something';
            O.t.sel_q.classList.remove('red-placeholder');
        })
    
        O.t.sel_go.addEventListener('click', go);
        O.t.sel_clearQ.addEventListener('click', clearQ);
        O.t.sel_refreshCache.addEventListener('click', toggle);
    }
}