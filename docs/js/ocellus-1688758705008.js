/* generated: Fri Jul 07 2023 21:38:25 GMT+0200 (Central European Summer Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),a={server:"localhost"===window.location.hostname?"http://localhost:3010/v3":"https://test.zenodeo.org/v3",cache:{zenodoImages:0,zenodeoImages:0,zenodeoTreatments:0},figureSize:{normal:250,small:100,tiny:50},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],params:{notValidQ:["resource","page","size","grid","refreshCache","cols"],validZenodo:["id","subtype","communities","q","creator","title","keywords"],validZenodeo:["httpUri","caption","captionText","treatmentId","treatmentTitle","articleTitle","treatmentDOI","articleDOI","zenodoDep","q","journalTitle","journalYear","authorityName","kingdom","phylum","class","family","order","genus","species","publicationDate","checkinTime","latitude","longitude","geolocation","isOnLand","validGeo","refreshCache","page","size","cols"],notValidSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"]},notq:["resource","page","size","grid","refreshCache","cols"],validZenodo:["id","subtype","communities","q","creator","title","keywords"],hiddenClasses:["hidden","noblock"],notInSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/record",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]}},r=function({selector:e,helpText:t,facets:a,cb:r}){const s=a.map((e=>e.key)),n=r;let o;const i=function({element:e,attribs:t,container:a}){const r=document.createElement(e);for(let[e,a]of Object.entries(t))"innerText"===e||"innerHTML"===e?r[e]=a:r.setAttribute(e,a);return a.appendChild(r),r},c=function(){const e=i({element:"div",attribs:{class:"fs-param-empty"},container:o});i({element:"div",attribs:{class:"fs-key fs-off"},container:e});const t=i({element:"input",attribs:{class:"query fs-key-input",placeholder:"choose a key…"},container:e});i({element:"div",attribs:{class:"fs-val fs-off"},container:e});const a=i({element:"input",attribs:{class:"query fs-val-input fs-off",placeholder:"choose a value…"},container:e}),r=i({element:"button",attribs:{class:"fs-cancel fs-off",type:"reset",innerHTML:"&#8855;"},container:e});t.addEventListener("keydown",l),a.addEventListener("keydown",l),r.addEventListener("click",u),d({type:"key",selector:t,values:s}),t.focus()},l=function(e){const t=(e=e||window.event).which||e.keyCode;let a=e.target;const r=a.parentElement,s=r.children[2],n=r.children[3],o=r.children[4];if(13==t)return""!==n.value&&(r.className="fs-param-filled",s.innerText=n.value,s.className="fs-val fs-on",n.className="fs-off",o.className="fs-cancel fs-on",c()),e.preventDefault(),e.stopPropagation(),!1;if((8==t||46==t)&&""===a.value){const e=`div#${fsDiv.id} div.fs-param-filled`,t=document.querySelectorAll(e),a=t[t.length-1];if(a)"fs-param-filled"===a.className?a.className="fs-param-filled fs-hilite":(a.className="fs-param-filled fs-hilite")&&a.parentElement.removeChild(a);else{const e=`div#${fsDiv.id} div.fs-param-empty`,t=document.querySelectorAll(e),a=t[t.length-1];a.parentElement.removeChild(a)}}},u=function(e){const t=this.parentElement;t.parentElement.removeChild(t)},d=function({type:e,selector:t,values:r}){new autoComplete({selector:t,source:async function(e,t){let a=[];if("function"==typeof r)a=r();else if("object"==typeof r&&r.url){const t=await fetch(`${r.url}${e}*`);if(!t.ok)throw Error("HTTP-Error: "+t.status);a=await r.cb(t)}else Array.isArray(r)&&(a=r);a.length&&t(a)},minChars:Array.isArray(r)?0:3,delay:150,onSelect:function(t,r,n){const o=this.selector,i=o.parentElement;if("key"===e){const e=i.children[0];e.innerText=o.value,e.className="fs-key fs-on",o.className="fs-off";const t=a.filter((e=>e.key===r))[0];t.noDuplicates&&s.splice(s.indexOf(r),1);const n=i.children[3];n.className="fs-val-input fs-on",n.placeholder=t.prompt,d({type:"val",selector:n,values:t.values}),n.focus()}else if("val"===e){const e=i.children[2];r&&(e.innerText=o.value,e.className="fs-val fs-on"),o.className="fs-off",i.className="fs-param-filled",i.children[4].className="fs-cancel fs-on",c()}}})},p=function(e){const t=o.childNodes;let r={},s=0;const n=t.length;for(;s<n;s++){const e=t[s].children,n=e[1].value;if(n){const t=e[3].value.replace(/\n$/,""),s=a.filter((e=>e.key===n))[0].actualKey;if(s&&t)if(s in r)if("string"==typeof r[s]){const e=r[s];r[s]=[e,t]}else r[s].push(t);else r[s]=t}}e(r)};!function(e,t){const a=i({element:"div",attribs:{id:"fs-widget"},container:e});o=i({element:"div",attribs:{id:"fs",class:"fs"},container:a});const r=i({element:"div",attribs:{class:"switch resource regular pill green","aria-label":"toggle resource","data-pop":"right","data-pop-no-shadow":!0,"data-pop-arrow":!0},container:o});i({element:"input",attribs:{type:"radio",id:"switchResource-3",name:"resource",value:"images",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-3"},container:r}),i({element:"input",attribs:{type:"radio",id:"switchResource-4",name:"resource",value:"treatments",class:"query",autocomplete:"off"},container:r}),i({element:"label",attribs:{for:"switchResource-4"},container:r}),i({element:"button",attribs:{id:"fs-go",type:"submit",class:"fs-button-primary",innerText:"go"},container:a}).addEventListener("click",(function(e){e.preventDefault(),e.stopPropagation(),p(n)})),c()}(e)},s=({resource:e,figureSize:t,rec:r})=>{const s={figureSize:t,rec:r};return"images"===e?(({figureSize:e,rec:t})=>{const r=`<img src="img/bug.gif" width="${t.figureSize}" data-src="${t.uri}" class="lazyload" data-recid="${t.treatmentId}" onerror="this.onerror=null; setTimeout(() => { this.src='${t.uri}' }, 1000);">`,s=t.zenodoRec?`Zenodo ID: <a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a>`:"";let n="";t.treatmentId&&(n=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>`);let o="";n?o=`<a href="${a.tbUri}/${t.treatmentId}" target="_blank">${r}</a>`:s&&(o=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">${r}</a>`);const i=250===e?"visible":"noblock",c=`figure-${e} `+(t.treatmentId?"tb":""),l=t.treatmentTitle.length>30?`${t.treatmentTitle.substring(0,30)}…`:t.treatmentTitle;return`<figure class="${c}">\n    <div class="switches">\n        <div class="close"></div>\n    </div>\n    ${o}\n    <figcaption class="${i}">\n        <details>\n            <summary class="figTitle" data-title="${t.treatmentTitle}">${l}</summary>\n            <p>${t.captionText}</p>\n            ${n}<br>\n            ${s}\n        </details>\n    </figcaption>\n</figure>`})(s):(({figureSize:e,rec:t})=>{let r="",s="";t.zenodoRec&&(r=`<a class="transition-050">Zenodo ID: ${t.zenodoRec}</a>`,s=`<a href="${a.zenodoUri}/${t.zenodoRec}" target="_blank">more on Zenodo</a><br>`);const n=250===e?"visible":"noblock";return`<figure class="${`figure-${e} `+(t.treatmentId?"tb":"")}">\n    <p class="articleTitle">${t.articleTitle}</p>\n    <p class="treatmentDOI">${t.treatmentDOI}</p>\n    <p class="articleAuthor">${t.articleAuthor}</p>\n    <figcaption class="${n}">\n        ${r}\n        <div>\n            <b class="figTitle">${t.title}</b><br>\n            ${s}\n            <a href="${a.tbUri}/${t.treatmentId}" target="_blank">more on TreatmentBank</a>\n        </div>\n    </figcaption>\n</figure>`})(s)},n=(t,r,s)=>{log.info("- renderSearchCriteria(qs, count)"),log.info(`  - qs: ${t}`),log.info(`  - count: ${r}`);const n=new URLSearchParams(t),o=n.get("resource");n.get("page"),n.get("size"),r||(r="sorry, no");const i=[];let c;a.notInSearchCriteria.forEach((e=>n.delete(e))),n.forEach(((e,t)=>{let a;const r=e.match(/(?<operator>\w+)\((?<term>[\w\s]+)\)/);if(r){const{operator:e,term:s}=r.groups;a=`<span class="crit-key">${t}</span> ${e.replace(/_/," ")} <span class="crit-val">${s}</span>`}else a="q"===t?`<span class="crit-key">${e}</span> is in the text`:`<span class="crit-key">${t}</span> is <span class="crit-val">${e}</span>`;i.push(a)}));const l=i.length;c=1===l?i[0]:2===l?`${i[0]} and ${i[1]}`:`${i.slice(0,l-2).join(", ")}, and ${i[l-1]}`,c=`<span class="crit-count">${r}</span> ${o} found where ${c}`,c+=s?'<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>':"",e("#search-criteria").innerHTML=c},o=(e,t)=>{let a=960;const r=document.getElementById("graphdiv"),s=r.offsetWidth;s<960&&(a=s);c(r,a,200,{x:"journal year",y1:"total",y2:"with images"},e,t)};let i;const c=(e,t,a,r,s,n)=>{const o={type:"line",data:{labels:n.map((e=>e.journalYear)),datasets:[{label:r.y1,data:n.map((e=>e.total)),borderColor:"rgba(255, 0, 0, 0.6)",borderWidth:1,backgroundColor:"rgba(255, 0, 0, 0.1)",pointStyle:"circle",pointRadius:3,pointBorderColor:"red"},{label:r.y2,data:n.map((e=>e.withImages)),borderColor:"rgba(0, 0, 255, 0.6)",borderWidth:1,backgroundColor:"rgba(0, 0, 255, 0.1)",pointStyle:"circle",pointRadius:3,pointBorderColor:"blue"}]},options:{interaction:{intersect:!1,mode:"x"},animation:!1,responsive:!0,scales:{x:{display:!0},y:{display:!0,type:"logarithmic",grid:{tickColor:e=>e.tick.major?"silver":"",color:e=>e.tick.major?"rgba(0, 0, 0, 0.4)":"silver"},border:{},min:1,afterBuildTicks:e=>{e.ticks=e.ticks.filter((({value:e})=>{const t=e/Math.pow(10,Math.floor(Math.log10(e)+1e-5));return Math.abs(t-Math.round(t))<1e-5}))},ticks:{callback:function(e,t,a){return 1e6===e?"1M":1e5===e?"100K":1e4===e?"10K":1e3===e?"1K":100===e?"100":10===e?"10":1===e?"1":""}}}},plugins:{title:{display:!0,text:`occurrence of '${s}' in text by year`},legend:{display:!0,position:"chartArea",labels:{usePointStyle:!0}},tooltip:{enabled:!0}}}};let c=document.getElementById("termFreq");c?(i.destroy(),i=new Chart(c,o)):(c=document.createElement("canvas"),c.id="termFreq",c.width=t,c.height=a,e.appendChild(c),i=new Chart(c,o))},l=async t=>{log.info("- getResource(qs)"),e("#throbber").classList.remove("nothrob");const r=new URLSearchParams(t),i=r.get("page"),c=r.get("size"),l=r.get("grid")||"normal",d=a.figureSize[l],p=r.get("resource");let h;r.has("q")&&(h=r.get("q")),Array.from(r).forEach((([e,t])=>{a.params.validZenodeo.includes(e)?t||(r.set("q",e),r.delete(e),h=e):r.delete(e)}));const m=["treatmentId","treatmentTitle","zenodoDep","treatmentDOI","articleTitle","articleAuthor","httpUri","caption"].join("&cols=");let f=`${r.toString()}&cols=${m}`;h&&(f+="&termFreq=true");const g=[];g.push(u({resource:p,queryString:f,figureSize:d})),Promise.all(g).then((e=>{const t={resource:p,prev:i>1?i-1:1,next:parseInt(i)+1,size:c,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.termFreq=e.termFreq,t.cacheHit=e.cacheHit)})),t})).then((a=>{const r=a.recs.map((e=>s({resource:p,figureSize:d,rec:e}))),i={figureSize:d,figures:r,qs:t,count:a.count,prev:a.prev,next:a.next,cacheHit:a.cacheHit};a.termFreq&&(i.termFreq=a.termFreq,i.term=h),(t=>{const{figureSize:a,figures:r,qs:s,count:i,term:c,termFreq:l,prev:u,next:d,cacheHit:p}=t;log.info(`- renderPage()\n    - figureSize: ${a}px\n    - figures: ${r.length} figures\n    - qs: ${s}\n    - count: ${i}\n    - prev: ${u}\n    - next: ${d}`),e("#grid-images").classList.add(`columns-${a}`),n(s,i,p),e("#throbber").classList.add("nothrob"),l&&o(c,l)})(i)}))},u=async({resource:e,queryString:t,figureSize:r})=>{log.info(`- getResults({ resource, queryString, figureSize })\n    - resource: ${e}\n    - queryString: ${t},\n    - figureSize: ${r}`);const s=`${a.server}/${e}?${t}`,n=await fetch(s);if(n.ok){const t=await n.json(),s=t.item.result.records,o={resource:e,count:0,recs:[],termFreq:t.item.result.termFreq,prev:"",next:"",cacheHit:t.cacheHit||!1};if(s)return o.count=o.count+t.item.result.count,s.forEach((e=>{const t={};t.treatmentId=e.treatmentId,t.treatmentTitle=e.treatmentTitle,t.zenodoRec=e.zenodoDep,t.figureSize=r;const s=e.httpUri.split("/")[4];e.httpUri.indexOf("zenodo")>-1?e.httpUri.indexOf(".svg")>-1?t.uri="/img/kein-preview.png":t.uri=`${a.zenodoUri}/${s}/thumb${r}`:t.uri=e.httpUri,t.captionText=e.captionText,t.treatmentDOI=e.treatmentDOI,t.articleTitle=e.articleTitle,t.articleAuthor=e.articleAuthor,o.recs.push(t)})),o}else alert("HTTP-Error: "+n.status)},d=()=>{log.info("- form2qs()");const e=new URLSearchParams;Array.from(t("form input.query")).filter((e=>e.value)).forEach((t=>{let a=t.name,r=t.value;if("q"===t.name){new URLSearchParams(t.value).forEach(((t,s)=>{if(""===t){const e=r.match(/(^10\.[0-9]{4,}.*)/);e&&e[1]?(a="articleDOI",r=e[1]):(a="q",r=s)}else a=s,r=t;e.append(a,r)}))}else"radio"===t.type||"checkbox"===t.type?(t.checked||"true"===t.checked)&&e.append(a,r):e.append(a,r)}));return e.toString()},p=r=>{log.info(`- qs2form(qs)\n    - qs: ${r}`);const s=new URLSearchParams(r);s.delete("refreshCache");const n=[];s.forEach(((r,s)=>{if(a.params.validZenodeo.includes(s))if(a.params.notValidQ.includes(s))"resource"===s?Array.from(t("input[name=resource]")).filter((e=>e.value===r))[0].checked="true":e(`input[name=${s}]`).value=r;else{let e=s;r&&(e="q"===s?r:`${s}=${r}`),n.push(e)}})),e("#q").value=n.join("&")},h=async t=>{const r=await(async e=>{if(!a.cache[e]){const t=`${a.server}/${e}?cols=`,r=await fetch(t);if(r.ok){const t=(await r.json()).item.result.count;a.cache[e]=t}else alert("HTTP-Error: "+r.status)}return a.cache[e]})(t);e("#help-msg").innerText=`search ${r} ${t}`},m=e=>{log.info("- updateUrl(qs)"),history.pushState("",null,`?${e}`)},f=()=>{log.info("- addListeners()"),e("#refreshCache").addEventListener("click",$),e("#ns-go").addEventListener("click",w),e("#q").addEventListener("focus",q),e("#search-help").addEventListener("click",g),e("div.examples").addEventListener("toggle",b,!0),t(".modalToggle").forEach((e=>e.addEventListener("click",S))),t(".reveal").forEach((e=>e.addEventListener("click",z)));t(".example-insert").forEach((e=>e.addEventListener("click",k)));t("input[name=searchType").forEach((e=>e.addEventListener("click",y)));t(".resource input").forEach((e=>e.addEventListener("click",v)))},g=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},y=a=>{e("#fancySearch").classList.toggle("hidden"),e("#fancySearch").classList.toggle("noblock"),e("#normalSearch").classList.toggle("hidden"),e("#normalSearch").classList.toggle("noblock");const r=Array.from(t("input[name=searchType]")).filter((e=>e.checked))[0].value;if(a){if("true"===a.target.dataset.checked){const t=e("input[data-checked=false]");t.dataset.checked=!0,t.checked=!0,a.target.dataset.checked="false",a.target.checked=!1}else{const t=e("input[data-checked=true]");t.dataset.checked=!1,t.checked=!1,a.target.dataset.checked="true",a.target.checked=!0}const s="fs"===r?"#fs":window.location.pathname;history.pushState?history.pushState(null,null,s):location.hash=s;const n=Array.from(t("input[name=resource]")),o=n.filter((e=>e.checked))[0],i=n.filter((e=>!e.checked&&e.value===o.value))[0];o.checked=!1,i.checked=!0}else{e("ns"===r?"#switchSearch-1":"#switchSearch-2").checked=!0}},v=e=>{const a=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0];h(a.value)},b=e=>{if(e.target.open){var a=t("details[open]");Array.prototype.forEach.call(a,(function(t){t!==e.target&&t.removeAttribute("open")}))}},k=a=>{e("#q").value=a.target.textContent,e("#ns-go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),g(),a.stopPropagation(),a.preventDefault()},$=t=>{e("#refreshCache").toggleAttribute("data-pop-show")},w=t=>{""===e("#q").value?q(t):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#ns-go").classList.remove("glowing"),(()=>{log.info("submitForm()");const e=d();m(e),l(e)})()),t.stopPropagation(),t.preventDefault()},S=r=>{const s=new URL(r.target.href).hash,n=t(".modal");s.length>0?(n.forEach((e=>{e.classList.add(...a.hiddenClasses)})),e(s).classList.remove(...a.hiddenClasses)):n.forEach((e=>e.classList.add(...a.hiddenClasses)))},q=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},z=e=>{const t=e.target.innerText;e.target.innerText=e.target.dataset.reveal,setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},T="localhost"===window.location.hostname?"INFO":"ERROR";log.level=log[T];const L=()=>{const e=new URL(location),t="#fs"===e.hash?"fs":"ns";if(x(t),"fs"===t&&v(),e.search){(e=>{log.info("loadBookmarkedWebSite(qs)"),log.info(`- qs: ${e}`),f(),p(e),e=d(),l(e)})(e.search.substring(1))}else log.info("loadBlankWebSite()"),f(),h("images")},x=s=>{log.info("initializing fancySearch");const n=e=>async t=>{const a=await t.json(),r=[];return a.item.result.records?a.item.result.records.forEach((t=>r.push(t[e]))):r.push("nothing found… please try again"),r},o=[{key:"text contains",actualKey:"q",values:"",prompt:"search the full text of treatments",noDuplicates:!0},{key:"title",actualKey:"treatmentTitle",values:"",prompt:"search for treatmentTitles starting with the search term",noDuplicates:!0},{key:"authority",actualKey:"authorityName",values:{url:`${a.server}/treatmentAuthors?treatmentAuthor=`,cb:n("author")},prompt:"type at least 3 letters to choose an author",noDuplicates:!0},{key:"family",actualKey:"family",values:{url:`${a.server}/families?family=`,cb:n("family")},prompt:"type at least 3 letters to choose a family",noDuplicates:!1},{key:"kingdom",actualKey:"kingdom",values:{url:`${a.server}/kingdoms?kingdom=`,cb:n("kingdom")},prompt:"type at least 3 letters to choose a kingdom",noDuplicates:!1},{key:"phylum",actualKey:"phylum",values:{url:`${a.server}/phyla?phylum=`,cb:n("phylum")},prompt:"type at least 3 letters to choose a phylum",noDuplicates:!1},{key:"class",actualKey:"class",values:{url:`${a.server}/classes?class=`,cb:n("class")},prompt:"type at least 3 letters to choose a class",noDuplicates:!1},{key:"genus",actualKey:"genus",values:{url:`${a.server}/genera?genus=`,cb:n("genus")},prompt:"type at least 3 letters to choose a genus",noDuplicates:!1},{key:"order",actualKey:"order",values:{url:`${a.server}/orders?order=`,cb:n("order")},prompt:"type at least 3 letters to choose an order",noDuplicates:!1},{key:"taxon",actualKey:"taxon",values:{url:`${a.server}/taxa?taxon=`,cb:n("taxon")},prompt:"type at least 3 letters to choose a taxon",noDuplicates:!1},{key:"journal year",actualKey:"journalYear",values:((e,t)=>{const a=t-e;return Array.from({length:a},((t,a)=>a+e)).map((e=>String(e)))})(1995,2022),prompt:"pick a year of publication",noDuplicates:!0}];new r({selector:e("#fs-container"),helpText:"search images",facets:o,cb:a=>{const r=new URLSearchParams(a),s=Array.from(t("input[name=resource]")).filter((e=>e.checked))[0].value,n=e("input[name=page").value,o=e("input[name=size").value;r.append("resource",s),r.append("page",n),r.append("size",o);const i=r.toString();m(i),l(i)}}),e("#fancySearch").classList.add("hidden"),e("#fancySearch").classList.add("noblock"),"fs"===s&&y()};export{L as init};
