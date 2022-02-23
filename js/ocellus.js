/* generated: Wed Feb 23 2022 11:49:49 GMT+0100 (Central European Standard Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),s={page:1,size:30,fpage:1,fsize:30,refreshCache:!1,views:{images:{description:"images from Zenodo",totalCount:0,figures:[],page:1,size:30},treatments:{description:"treatments with images",totalCount:0,countOfTreatments:0,countOfFigures:0,figures:[],page:1,size:30,figpage:2,figsize:30},map:{description:"treatments with locations",totalCount:0,obj:null,bounds:null,layers:{baselayer:{groups:{osm:null}},h3:{groups:{grid2:null},controls:{info:null,legend:null}},treatments:{groups:{treatmentsOnLand:null,treatmentsInWater:null},controls:{layerControl:null}}}}},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],validQueryParams:["communities","view","page","size","q"],not_q:["view","refreshCache","go"],hiddenClasses:["hidden","noblock"],notInSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/record",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},pager_length:9,sep:"•••",sep_position1:2,sep_position2:6},r=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},n=e=>{if(e.target.open){var s=t("details[open]");Array.prototype.forEach.call(s,(function(t){t!==e.target&&t.removeAttribute("open")}))}},o=s=>{e("#q").value=s.target.closest("details").querySelector("summary").textContent,e("#go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),r(),s.stopPropagation(),s.preventDefault()},a=t=>{e("#refreshCache").classList.contains("unchecked")?(e("#refreshCache").classList.remove("unchecked"),e("#refreshCache").classList.add("checked"),e("#refreshCache").checked=!0,e("#refreshCacheMsg").classList.remove("hidden")):(e("#refreshCache").classList.remove("checked"),e("#refreshCache").classList.add("unchecked"),e("#refreshCache").checked=!1,e("#refreshCacheMsg").classList.add("hidden"))},i=s=>{const r=e("#q").value;if(""===r)l(s);else{if(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#go").classList.remove("glowing"),r.indexOf("=")>-1){t("input[name=source]").forEach((e=>{"treatments"===e.value&&(e.checked=!0)}))}p()}s.stopPropagation(),s.preventDefault()},c=r=>{const n=new URL(r.target.href).hash,o=t(".modal");n.length>0?(o.forEach((e=>{e.classList.add(...s.hiddenClasses)})),e(n).classList.remove(...s.hiddenClasses)):o.forEach((e=>e.classList.add(...s.hiddenClasses)))},l=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},d=t=>{e("#q").value="",e("#refreshCache").checked=!1,t.stopPropagation(),t.preventDefault()},g=e=>{const t=e.target.innerText;console.log(t),e.target.innerText=e.target.dataset.reveal,console.log(e.target.innerText),setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},u=e=>{const s=t("figcaption");for(let e=0,t=s.length;e<t;e++)s[e].querySelector("div").classList.remove("open"),s[e].querySelector("div").classList.add("closed");const r=e.target.parentElement;r.querySelector("div").classList.remove("closed"),r.querySelector("div").classList.add("open")},h=()=>{log.info("case1()"),log.info("- listeners.addListeners()"),e("#refreshCache").addEventListener("click",a),e("#go").addEventListener("click",i),t(".modalToggle").forEach((e=>e.addEventListener("click",c))),e("#q").addEventListener("focus",l),e("#clear-q").addEventListener("click",d),e("#help").addEventListener("click",r),t(".example-insert").forEach((e=>e.addEventListener("click",o))),e("div.examples").addEventListener("toggle",n,!0),t(".reveal").forEach((e=>e.addEventListener("click",g)))},p=()=>{log.info("case2()");const e=f();v(e),L(e)},f=()=>{log.info("- form2qs()");const e=new URLSearchParams;return t("form input").forEach((t=>{if("q"===t.id){new URLSearchParams(t.value).forEach(((t,s)=>{""===t?e.append("q",s):e.append(s,t)}))}else"refreshCache"===t.id?t.checked&&e.append("refreshCache",!0):"source"===t.name?t.checked&&e.append("source",t.value):e.append(t.id,t.value)})),e.toString()},m=s=>{log.info("- qs2form(qs)"),log.info(`  - qs: ${s}`);const r=new URLSearchParams(s);r.delete("refreshCache");const n=["source","page","size"];let o=[];r.forEach(((s,r)=>{if(n.includes(r))if("source"===r){t("input[name=source]").forEach((e=>{e.value===s&&(e.checked=!0)}))}else e(`#${r}`).value=s;else{const e="q"===r?s:`${r}=${s}`;o.push(e)}}));const a=o.join("&");if(a.indexOf("=")>-1){t("input[name=source]").forEach((e=>{"treatments"===e.value&&(e.checked=!0)}))}e("#q").value=a},v=e=>{log.info("- updateUrl(qs)"),log.info(`  - qs: ${e}`),history.pushState("",null,`?${e}`)},L=async function(e){log.info("- getImages(qs)"),log.info(`  - qs: ${e}`);const t=new URLSearchParams(e),s=t.get("source");t.delete("source");const r=t.toString(),n=[],o={resource:"images",queryString:r},a={resource:"treatments",queryString:`${r}&httpUri=ne()&cols=treatmentTitle&cols=zenodoDep&cols=httpUri&cols=captionText`};"all"===s?n.push($(o),$(a)):"Zenodo"===s?n.push($(o)):"treatments"===s&&n.push($(a));const i=t.get("page"),c=t.get("size");Promise.all(n).then((e=>{const t={prev:i>1?i-1:1,next:parseInt(i)+1,size:c,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count)})),t})).then((t=>{const s={};t.recs.forEach((e=>{const t=q({size:250,treatmentId:e.treatmentId,title:e.title,zenodoRec:e.zenodoRec,uri:e.uri,caption:e.caption});s[e.uri]=t})),b({figures:Object.values(s),qs:e,count:t.count,prev:t.prev,next:t.next})}))},$=async({resource:e,queryString:t})=>{log.info("- getResource()"),log.info(`  - resource: ${e}`),log.info(`  - queryString: ${t}`);const r=`${O.zenodeo3Uri}/${e}?${t}`,n=await fetch(r);if(n.ok){const t=await n.json(),r=t.item.result.records,o={count:0,recs:[],prev:"",next:""};if(r)return o.count=o.count+t.item.result.count,r.forEach((t=>{if("images"===e){let e="/img/kein-preview.png";"thumbs"in t.links&&(e=t.links.thumbs[250]),o.recs.push({treatmentId:"",title:t.metadata.title,zenodoRec:t.id,uri:e,caption:t.metadata.description})}else if("treatments"===e){const e=t.httpUri.split("/")[4],r=t.httpUri.indexOf("zenodo")>-1?`${s.zenodoUri}/${e}/thumb250`:t.httpUri;o.recs.push({treatmentId:t.treatmentId,title:t.treatmentTitle,zenodoRec:t.zenodoDep,uri:r,caption:t.captionText})}})),o}else alert("HTTP-Error: "+n.status)},q=({size:e,treatmentId:t,title:r,zenodoRec:n,uri:o,caption:a})=>{log.info("- makeFigure()");let i="";n&&(i=`<a href="${s.zenodoUri}/${n}" target="_blank">more on Zenodo</a><br></br>`);let c="",l="";return t&&(c=`<div class="treatmentId reveal" data-reveal="${t}">T</div>`,l=`<a href="${s.tbUri}/${t}" target="_blank">more on TreatmentBank</a>`),`<figure class="figure-${e}">\n    <div class="switches">\n        ${c}\n        <div class="close"></div>\n    </div>\n    <picture>\n        <img src="/img/bug.gif" width="${e}" data-src="${o}" class="lazyload" data-recid="${t}">\n    </picture>\n    <figcaption>\n        <a class="transition-050">Zenodo ID: ${n}</a>\n        <div class="closed">\n            <b class="figTitle">${r}</b><br>\n            ${a}<br>\n            ${i}\n            ${l}\n        </div>\n    </figcaption>\n</figure>`},b=({figures:e,qs:t,count:s,prev:r,next:n})=>{log.info("- renderPage()"),log.info(`  - figures: ${e.length} figures`),log.info(`  - qs: ${t}`),log.info(`  - count: ${s}`),log.info(`  - prev: ${r}`),log.info(`  - next: ${n}`),k(e,t,r,n)},k=(s,r,n,o)=>{log.info("- renderFigures()"),s.length?(e("#grid-images").innerHTML=s.join(""),z(r,n,o)):e("#grid-images").innerHTML='<p class="nada">sorry, no images found</p>',e("#throbber").classList.add("nothrob"),(()=>{const e=t("figcaption > a");for(let t=0,s=e.length;t<s;t++)e[t].addEventListener("click",u)})(),(()=>{const e=t("figure .reveal");for(let t=0,s=e.length;t<s;t++)e[t].addEventListener("click",g)})()},z=(t,s,r)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${s}`),log.info(`  - next: ${r}`);const n=new URLSearchParams(t);n.delete("page"),e("#pager").innerHTML=`<a href="?${n.toString()}&page=${s}">prev</a> <a href="?${n.toString()}&page=${r}">next</a>`,e("#pager").classList.add("filled"),log.info("- listeners.addListenersToPagerLinks()")};log.level=log[O.loglevel];const C=()=>{let e=new URL(location).search;e?("?"===e.substring(0,1)&&(e=e.substring(1)),(e=>{log.info("case3(qs)"),log.info(`- qs: ${e}`),h(),m(e),L(e)})(e)):h()};export{C as init};
