/* generated: Wed Jul 05 2023 14:30:25 GMT+0200 (Central European Summer Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),a={server:"localhost"===window.location.hostname?"http://localhost:3010/v3":"https://test.zenodeo.org/v3",cache:{zenodoImages:0,zenodeoImages:0,zenodeoTreatments:0},figureSize:{normal:250,small:100,tiny:50},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validZenodo:["id","subtype","communities","q","creator","title","keywords"],validZenodeo:["httpUri","caption","captionText","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","q","journalTitle","journalYear","authorityName","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","refreshCache","page","size","cols"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"]},notq:["resource","page","size","grid","refreshCache","cols"],validZenodo:["id","subtype","communities","q","creator","title","keywords"],hiddenClasses:["hidden","noblock"],notInSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/record",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]}},r=function({selector:e,helpText:t,facets:a,cb:r}){const s=a.map((e=>e.key)),n=r;let o;const i=function({element:e,attribs:t,container:a}){const r=document.createElement(e);for(let[e,a]of Object.entries(t))"innerText"===e||"innerHTML"===e?r[e]=a:r.setAttribute(e,a);return a.appendChild(r),r},c=function(){const e=i({element:"div",attribs:{class:"fs-param-empty"},container:o});i({element:"div",attribs:{class:"fs-key fs-off"},container:e});const t=i({element:"input",attribs:{class:"query fs-key-input",placeholder:"choose a key…"},container:e});i({element:"div",attribs:{class:"fs-val fs-off"},container:e});const a=i({element:"input",attribs:{class:"query fs-val-input fs-off",placeholder:"choose a value…"},container:e}),r=i({element:"button",attribs:{class:"fs-cancel fs-off",type:"reset",innerHTML:"&#8855;"},container:e});t.addEventListener("keydown",l),a.addEventListener("keydown",l),r.addEventListener("click",u),d({type:"key",selector:t,values:s}),t.focus()},l=function(e){const t=(e=e||window.event).which||e.keyCode;let a=e.target;const r=a.parentElement,s=r.children[2],n=r.children[3],o=r.children[4];if(13==t)return""!==n.value&&(r.className="fs-param-filled",s.innerText=n.value,s.className="fs-val fs-on",n.className="fs-off",o.className="fs-cancel fs-on",c()),e.preventDefault(),e.stopPropagation(),!1;if((8==t||46==t)&&""===a.value){const e=`div#${fsDiv.id} div.fs-param-filled`,t=document.querySelectorAll(e),a=t[t.length-1];if(a)"fs-param-filled"===a.className?a.className="fs-param-filled fs-hilite":(a.className="fs-param-filled fs-hilite")&&a.parentElement.removeChild(a);else{const e=`div#${fsDiv.id} div.fs-param-empty`,t=document.querySelectorAll(e),a=t[t.length-1];a.parentElement.removeChild(a)}}},u=function(e){const t=this.parentElement;t.parentElement.removeChild(t)},d=function({type:e,selector:t,values:r}){new autoComplete({selector:t,source:async function(e,t){let a=[];if("function"==typeof r)a=r();else if("object"==typeof r&&r.url){const t=await fetch(`${r.url}${e}*`);if(!t.ok)throw Error("HTTP-Error: "+t.status);a=await r.cb(t)}else Array.isArray(r)&&(a=r);a.length&&t(a)},minChars:Array.isArray(r)?0:3,delay:150,onSelect:function(t,r,n){const o=this.selector,i=o.parentElement;if("key"===e){const e=i.children[0];e.innerText=o.value,e.className="fs-key fs-on",o.className="fs-off";const t=a.filter((e=>e.key===r))[0];t.noDuplicates&&s.splice(s.indexOf(r),1);const n=i.children[3];n.className="fs-val-input fs-on",n.placeholder=t.prompt,d({type:"val",selector:n,values:t.values}),n.focus()}else if("val"===e){const e=i.children[2];r&&(e.innerText=o.value,e.className="fs-val fs-on"),o.className="fs-off",i.className="fs-param-filled",i.children[4].className="fs-cancel fs-on",c()}}})},p=function(e){const t=o.childNodes;let r={},s=0;const n=t.length;for(;s<n;s++){const e=t[s].children,n=e[1].value;if(n){const t=e[3].value.replace(/\n$/,""),s=a.filter((e=>e.key===n))[0].actualKey;if(s&&t)if(s in r)if("string"==typeof r[s]){const e=r[s];r[s]=[e,t]}else r[s].push(t);else r[s]=t}}e(r)};!function(e,t){const a=i({element:"div",attribs:{id:"fs-widget"},container:e});o=i({element:"div",attribs:{id:"fs",class:"fs"},container:a});const r=i({element:"div",attribs:{class:"switch resource regular pill green","aria-label":"toggle resource","data-pop":"right","data-pop-no-shadow":!0,"data-pop-arrow":!0},container:o});i({element:"input",attribs:{type:"radio",id:"switchResource-3",name:"resource",value:"images",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-3"},container:r}),i({element:"input",attribs:{type:"radio",id:"switchResource-4",name:"resource",value:"treatments",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-4"},container:r}),i({element:"button",attribs:{id:"fs-go",type:"submit",class:"fs-button-primary",innerText:"go"},container:a}).addEventListener("click",(function(e){e.preventDefault(),e.stopPropagation(),p(n)})),c()}(e)},s=({resource:e,figureSize:t,rec:r})=>{const s={figureSize:t,rec:r};return"images"===e?(({figureSize:e,rec:t})=>{const r=`<img src="img/bug.gif" width="${t.figureSize}" data-src="${t.uri}" class="lazyload" data-recid="${t.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${t.uri}' }, 1000);">`,s=t.zenodoRec?`Zenodo ID: <a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a>`:"";let n="";t.treatmentId&&(n=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>`);let o="";n?o=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">${r}</a>`:s&&(o=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">${r}</a>`);const i=250===e?"visible":"noblock",c=`figure-${e} `+(t.treatmentId?"tb":""),l=t.treatmentTitle.length>30?`${t.treatmentTitle.substring(0,30)}…`:t.treatmentTitle;return`<figure class="${c}">\n    <div class="switches">\n        <div class="close"></div>\n    </div>\n    ${o}\n    <figcaption class="${i}">\n        <details>\n            <summary class="figTitle" data-title="${t.treatmentTitle}">${l}</summary>\n            <p>${t.captionText}</p>\n            ${n}<br>\n            ${s}\n        </details>\n    </figcaption>\n</figure>`})(s):(({figureSize:e,rec:t})=>{let r="",s="";t.zenodoRec&&(r=`<a class="transition-050">Zenodo ID: ${t.zenodoRec}</a>`,s=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a><br>`);const n=250===e?"visible":"noblock";return`<figure class="${`figure-${e} `+(t.treatmentId?"tb":"")}">\n    <p class="articleTitle">${t.articleTitle}</p>\n    <p class="treatmentDOI">${t.treatmentDOI}</p>\n    <p class="articleAuthor">${t.articleAuthor}</p>\n    <figcaption class="${n}">\n        ${r}\n        <div>\n            <b class="figTitle">${t.title}</b><br>\n            ${s}\n            <a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>\n        </div>\n    </figcaption>\n</figure>`})(s)},n=(t,a,r,s)=>{log.info("- renderFigures()"),t.length&&(e("#grid-images").innerHTML=t.join(""),o(a,r,s),z(),E())},o=(t,a,r)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${a}`),log.info(`  - next: ${r}`);const s=new URLSearchParams(t);s.delete("page"),e("#pager").innerHTML=`<a href="?${s.toString()}&page=${a}">prev</a> <a href="?${s.toString()}&page=${r}">next</a>`,e("#pager").classList.add("filled"),x()},i=(t,r,s)=>{log.info("- renderSearchCriteria(qs, count)"),log.info(`  - qs: ${t}`),log.info(`  - count: ${r}`);const n=new URLSearchParams(t),o=n.get("resource");n.get("page"),n.get("size"),r||(r="sorry, no");const i=[];let c;a.notInSearchCriteria.forEach((e=>n.delete(e))),n.forEach(((e,t)=>{let a;const r=e.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);if(r){const{operator:e,term:s}=r.groups;a=`<span class="crit-key">${t}</span> ${e.replace(/_/," ")} <span class="crit-val">${s}</span>`}else a="q"===t?`<span class="crit-key">${e}</span> is in the text`:`<span class="crit-key">${t}</span> is <span class="crit-val">${e}</span>`;i.push(a)}));const l=i.length;c=1===l?i[0]:2===l?`${i[0]} and ${i[1]}`:`${i.slice(0,l-2).join(", ")}, and ${i[l-1]}`,c=`<span class="crit-count">${r}</span> ${o} found where ${c}`,c+=s?'<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>':"",e("#search-criteria").innerHTML=c},c=e=>{let t=960;const a=document.getElementById("graphdiv"),r=a.offsetWidth;r<960&&(t=r);l(a,t,150,{x:"journal year",y1:"total",y2:"with images"},e)},l=(e,t,a,r,s)=>{const n=document.createElement("canvas");n.id="termFreq",n.width=t,n.height=a,e.appendChild(n);const o={type:"line",data:{labels:s.map((e=>e.journalYear)),datasets:[{label:r.y1,data:s.map((e=>e.total)),borderWidth:1},{label:r.y2,data:s.map((e=>e.withImages)),borderWidth:1}]},options:{interaction:{intersect:!1,mode:"x"},animation:!1,responsive:!0,scales:{x:{display:!0},y:{display:!0,type:"logarithmic",grid:{borderColor:"grey",tickColor:"grey"},min:1,ticks:{callback:function(e,t,a){return 1e6===e?"1M":1e5===e?"100K":1e4===e?"10K":1e3===e?"1K":100===e?"100":10===e?"10":1===e?"1":null},stepSize:50}}},plugins:{legend:{display:!0,position:"chartArea"},tooltip:{enabled:!0}}}};new Chart(n,o)},u=async t=>{log.info("- getResource(qs)"),e("#throbber").classList.remove("nothrob");const r=new URLSearchParams(t),o=r.get("page"),l=r.get("size"),u=r.get("grid")||"normal",p=a.figureSize[u],h=r.get("resource");Array.from(r).forEach((([e,t])=>{a.params.validZenodeo.includes(e)?t||(r.set("q",e),r.delete(e)):r.delete(e)}));const f=`${r.toString()}&${["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption"].map((e=>`cols=${e}`)).join("&")}&termFreq=true`,m=[];m.push(d({resource:h,queryString:f,figureSize:p})),Promise.all(m).then((e=>{const t={resource:h,prev:o>1?o-1:1,next:parseInt(o)+1,size:l,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.termFreq=e.termFreq,t.cacheHit=e.cacheHit)})),t})).then((a=>{const r=a.recs.map((e=>s({resource:h,figureSize:p,rec:e})));(({figureSize:t,figures:a,qs:r,count:s,termFreq:o,prev:l,next:u,cacheHit:d})=>{log.info(`- renderPage()\n    - figureSize: ${t}px\n    - figures: ${a.length} figures\n    - qs: ${r}\n    - count: ${s}\n    - prev: ${l}\n    - next: ${u}`),e("#grid-images").classList.add(`columns-${t}`),n(a,r,l,u),i(r,s,d),e("#throbber").classList.add("nothrob"),c(o)})({figureSize:p,figures:r,qs:t,count:a.count,termFreq:a.termFreq,prev:a.prev,next:a.next,cacheHit:a.cacheHit})}))},d=async({resource:e,queryString:t,figureSize:r})=>{log.info(`- getResults({ resource, queryString, figureSize })\n    - resource: ${e}\n    - queryString: ${t},\n    - figureSize: ${r}`);const s=`${a.server}/${e}?${t}`,n=await fetch(s);if(n.ok){const t=await n.json(),s=t.item.result.records,o={resource:e,count:0,recs:[],termFreq:t.item.result.termFreq,prev:"",next:"",cacheHit:t.cacheHit||!1};if(s)return o.count=o.count+t.item.result.count,s.forEach((e=>{const t={};t.treatmentId=e.treatmentId,t.treatmentTitle=e.treatmentTitle,t.zenodoRec=e.zenodoDep,t.figureSize=r;const s=e.httpUri.split("/")[4];e.httpUri.indexOf("zenodo")>-1?e.httpUri.indexOf(".svg")>-1?t.uri="/img/kein-preview.png":t.uri=`${a.zenodoUri}/${s}/thumb${r}`:t.uri=e.httpUri,t.captionText=e.captionText,t.treatmentDOI=e.treatmentDOI,t.articleTitle=e.articleTitle,t.articleAuthor=e.articleAuthor,o.recs.push(t)})),o}else alert("HTTP-Error: "+n.status)},p=()=>{log.info("- form2qs()");const e=new URLSearchParams;Array.from(t("form input.query")).filter((e=>e.value)).forEach((t=>{let a=t.name,r=t.value;if("q"===t.name){new URLSearchParams(t.value).forEach(((t,s)=>{if(""===t){const e=r.match(/(^10\.[0-9]{4,}.*)/);e&&e[1]?(a="articleDOI",r=e[1]):(a="q",r=s)}else a=s,r=t;e.append(a,r)}))}else"radio"===t.type||"checkbox"===t.type?(t.checked||"true"===t.checked)&&e.append(a,r):e.append(a,r)}));return e.toString()},h=r=>{log.info(`- qs2form(qs)\n    - qs: ${r}`);const s=new URLSearchParams(r);s.delete("refreshCache");const n=[];s.forEach(((r,s)=>{if(a.params.validZenodeo.includes(s))if(a.params.notValidQ.includes(s))"resource"===s?Array.from(t("input[name=resource]")).filter((e=>e.value===r))[0].checked="true":e(`input[name=${s}]`).value=r;else{let e=s;r&&(e="q"===s?r:`${s}=${r}`),n.push(e)}})),e("#q").value=n.join("&")},f=async t=>{const r=await(async e=>{if(!a.cache[e]){const t=`${a.server}/${e}?cols=`,r=await fetch(t);if(r.ok){const t=(await r.json()).item.result.count;a.cache[e]=t}else alert("HTTP-Error: "+r.status)}return a.cache[e]})(t);e("#help-msg").innerText=`search ${r} ${t}`},m=e=>{log.info("- updateUrl(qs)"),history.pushState("",null,`?${e}`)},g=()=>{log.info("- addListeners()"),e("#refreshCache").addEventListener("click",w),e("#ns-go").addEventListener("click",S),e("#q").addEventListener("focus",L),e("#search-help").addEventListener("click",y),e("div.examples").addEventListener("toggle",b,!0),t(".modalToggle").forEach((e=>e.addEventListener("click",T))),t(".reveal").forEach((e=>e.addEventListener("click",q)));t(".example-insert").forEach((e=>e.addEventListener("click",k)));t("input[name=searchType").forEach((e=>e.addEventListener("click",v)));t(".resource input").forEach((e=>e.addEventListener("click",$)))},y=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},v=a=>{e("#fancySearch").classList.toggle("hidden"),e("#fancySearch").classList.toggle("noblock"),e("#normalSearch").classList.toggle("hidden"),e("#normalSearch").classList.toggle("noblock");const r=Array.from(t("input[name=searchType]")).filter((e=>e.checked))[0].value;if(a){if("true"===a.target.dataset.checked){const t=e("input[data-checked=false]");t.dataset.checked=!0,t.checked=!0,a.target.dataset.checked="false",a.target.checked=!1}else{const t=e("input[data-checked=true]");t.dataset.checked=!1,t.checked=!1,a.target.dataset.checked="true",a.target.checked=!0}const s="fs"===r?"#fs":window.location.pathname;history.pushState?history.pushState(null,null,s):location.hash=s;const n=Array.from(t("input[name=resource]")),o=n.filter((e=>e.checked))[0],i=n.filter((e=>!e.checked&&e.value===o.value))[0];o.checked=!1,i.checked=!0}else{e("ns"===r?"#switchSearch-1":"#switchSearch-2").checked=!0}},$=e=>{const a=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0];f(a.value)},b=e=>{if(e.target.open){var a=t("details[open]");Array.prototype.forEach.call(a,(function(t){t!==e.target&&t.removeAttribute("open")}))}},k=a=>{e("#q").value=a.target.textContent,e("#ns-go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),y(),a.stopPropagation(),a.preventDefault()},w=t=>{e("#refreshCache").toggleAttribute("data-pop-show")},S=t=>{""===e("#q").value?L(t):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#ns-go").classList.remove("glowing"),(()=>{log.info("submitForm()");const e=p();m(e),u(e)})()),t.stopPropagation(),t.preventDefault()},T=r=>{const s=new URL(r.target.href).hash,n=t(".modal");s.length>0?(n.forEach((e=>{e.classList.add(...a.hiddenClasses)})),e(s).classList.remove(...a.hiddenClasses)):n.forEach((e=>e.classList.add(...a.hiddenClasses)))},L=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},q=e=>{const t=e.target.innerText;e.target.innerText=e.target.dataset.reveal,setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},z=()=>{const e=t("figcaption > details");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("toggle",(a=>{const r=a.target.querySelector("summary"),s=r.dataset.title,n=s.length>30?`${s.substring(0,30)}…`:s;e[t].open?r.innerText=s:r.innerText=n}))},x=()=>{log.info("- listeners.addListenersToPagerLinks()")},E=()=>{const e=t("figure .reveal");for(let t=0,a=e.length;t<a;t++)e[t].addEventListener("click",q)},D="localhost"===window.location.hostname?"INFO":"ERROR";log.level=log[D];const C=()=>{const e=new URL(location),t="#fs"===e.hash?"fs":"ns";if(A(t),"fs"===t&&$(),e.search){(e=>{log.info("loadBookmarkedWebSite(qs)"),log.info(`- qs: ${e}`),g(),h(e),e=p(),u(e)})(e.search.substring(1))}else log.info("loadBlankWebSite()"),g(),f("images")},A=s=>{log.info("initializing fancySearch");const n=e=>async t=>{const a=await t.json(),r=[];return a.item.result.records?a.item.result.records.forEach((t=>r.push(t[e]))):r.push("nothing found… please try again"),r},o=[{key:"text contains",actualKey:"q",values:"",prompt:"search the full text of treatments",noDuplicates:!0},{key:"title",actualKey:"treatmentTitle",values:"",prompt:"search for treatmentTitles starting with the search term",noDuplicates:!0},{key:"authority",actualKey:"authorityName",values:{url:`${a.server}/treatmentAuthors?treatmentAuthor=`,cb:n("author")},prompt:"type at least 3 letters to choose an author",noDuplicates:!0},{key:"family",actualKey:"family",values:{url:`${a.server}/families?family=`,cb:n("family")},prompt:"type at least 3 letters to choose a family",noDuplicates:!1},{key:"kingdom",actualKey:"kingdom",values:{url:`${a.server}/kingdoms?kingdom=`,cb:n("kingdom")},prompt:"type at least 3 letters to choose a kingdom",noDuplicates:!1},{key:"phylum",actualKey:"phylum",values:{url:`${a.server}/phyla?phylum=`,cb:n("phylum")},prompt:"type at least 3 letters to choose a phylum",noDuplicates:!1},{key:"class",actualKey:"class",values:{url:`${a.server}/classes?class=`,cb:n("class")},prompt:"type at least 3 letters to choose a class",noDuplicates:!1},{key:"genus",actualKey:"genus",values:{url:`${a.server}/genera?genus=`,cb:n("genus")},prompt:"type at least 3 letters to choose a genus",noDuplicates:!1},{key:"order",actualKey:"order",values:{url:`${a.server}/orders?order=`,cb:n("order")},prompt:"type at least 3 letters to choose an order",noDuplicates:!1},{key:"taxon",actualKey:"taxon",values:{url:`${a.server}/taxa?taxon=`,cb:n("taxon")},prompt:"type at least 3 letters to choose a taxon",noDuplicates:!1},{key:"journal year",actualKey:"journalYear",values:((e,t)=>{const a=t-e;return Array.from({length:a},((t,a)=>a+e)).map((e=>String(e)))})(1995,2022),prompt:"pick a year of publication",noDuplicates:!0}];new r({selector:e("#fs-container"),helpText:"search images",facets:o,cb:a=>{const r=new URLSearchParams(a),s=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0].value,n=e("input[name=page").value,o=e("input[name=size").value;r.append("resource",s),r.append("page",n),r.append("size",o);const i=r.toString();m(i),u(i)}}),e("#fancySearch").classList.add("hidden"),e("#fancySearch").classList.add("noblock"),"fs"===s&&v()};export{C as init};
