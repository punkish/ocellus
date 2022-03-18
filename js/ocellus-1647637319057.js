/* generated: Fri Mar 18 2022 22:01:59 GMT+0100 (Central European Standard Time) */
const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e),r={page:1,size:30,fpage:1,fsize:30,refreshCache:!1,figureSize:250,views:{images:{description:"images from Zenodo",totalCount:0,figures:[],page:1,size:30},treatments:{description:"treatments with images",totalCount:0,countOfTreatments:0,countOfFigures:0,figures:[],page:1,size:30,figpage:2,figsize:30},map:{description:"treatments with locations",totalCount:0,obj:null,bounds:null,layers:{baselayer:{groups:{osm:null}},h3:{groups:{grid2:null},controls:{info:null,legend:null}},treatments:{groups:{treatmentsOnLand:null,treatmentsInWater:null},controls:{layerControl:null}}}}},results:{totalCount:0,figures:[],page:1,size:30},resources:["treatments","citations","images"],pseudoResources:["about","ip","contact","privacy"],notq:["source","page","size","grid","refreshCache"],validZenodo:["id","subtype","communities","q","creator","title","keywords"],validZenodeo:["q","httpUri","captionText","refreshCache","page","size"],hiddenClasses:["hidden","noblock"],notInSearchCriteria:["resource","communities","communitiesChooser","refreshCache","view","size","page","reset","submit","source","grid"],closedFigcaptionHeight:"30px",zenodoUri:"https://zenodo.org/record",tbUri:"https://tb.plazi.org/GgServer/html",H3ColorRamp:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#b10026"],treatmentIcon:{iconUrl:"/img/treatment.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},treatmentIconHighlighted:{iconUrl:"/img/treatment-highlighted.svg",iconSize:[24,24],iconAnchor:[0,0],popupAnchor:[13,12]},pager_length:9,sep:"•••",sep_position1:2,sep_position2:6},s=t=>{e(".examples").classList.contains("hidden")?e(".examples").classList.remove("hidden"):e(".examples").classList.add("hidden")},a=e=>{if(e.target.open){var r=t("details[open]");Array.prototype.forEach.call(r,(function(t){t!==e.target&&t.removeAttribute("open")}))}},n=r=>{e("#q").value=r.target.closest("details").querySelector("summary").textContent,e("#go").classList.add("glowing");t("input[name=source").forEach((e=>{"treatments"===e.value&&(e.checked=!0)})),s(),r.stopPropagation(),r.preventDefault()},o=t=>{e("#refreshCache").classList.contains("unchecked")?(e("#refreshCache").classList.remove("unchecked"),e("#refreshCache").classList.add("checked"),e("#refreshCache").checked=!0,e("#refreshCacheMsg").classList.remove("hidden")):(e("#refreshCache").classList.remove("checked"),e("#refreshCache").classList.add("unchecked"),e("#refreshCache").checked=!1,e("#refreshCacheMsg").classList.add("hidden"))},i=t=>{""===e("#q").value?l(t):(e("#q").classList.remove("red-placeholder"),e("#throbber").classList.remove("nothrob"),e("#go").classList.remove("glowing"),f()),t.stopPropagation(),t.preventDefault()},c=s=>{const a=new URL(s.target.href).hash,n=t(".modal");a.length>0?(n.forEach((e=>{e.classList.add(...r.hiddenClasses)})),e(a).classList.remove(...r.hiddenClasses)):n.forEach((e=>e.classList.add(...r.hiddenClasses)))},l=t=>{e("#q").placeholder="search for something",e("#q").classList.remove("red-placeholder"),t.stopPropagation(),t.preventDefault()},d=t=>{e("#q").value="",e("#refreshCache").checked=!1,t.stopPropagation(),t.preventDefault()},g=e=>{const t=e.target.innerText;e.target.innerText=e.target.dataset.reveal,setTimeout((()=>{e.target.innerHTML=t}),2e3),e.stopPropagation(),e.preventDefault()},h=e=>{const r=t("figcaption");for(let e=0,t=r.length;e<t;e++)r[e].querySelector("div").classList.remove("open"),r[e].querySelector("div").classList.add("closed");const s=e.target.parentElement;s.querySelector("div").classList.remove("closed"),s.querySelector("div").classList.add("open")};let u=r.figureSize;const p=()=>{log.info("case1()"),log.info("- listeners.addListeners()"),e("#refreshCache").addEventListener("click",o),e("#go").addEventListener("click",i),t(".modalToggle").forEach((e=>e.addEventListener("click",c))),e("#q").addEventListener("focus",l),e("#clear-q").addEventListener("click",d),e("#search-help").addEventListener("click",s),t(".example-insert").forEach((e=>e.addEventListener("click",n))),e("div.examples").addEventListener("toggle",a,!0),t(".reveal").forEach((e=>e.addEventListener("click",g)))},f=()=>{log.info("case2()");const e=m();$(e),L(e)},m=()=>{log.info("- form2qs()");const e=new URLSearchParams;return t("form input").forEach((t=>{if("q"===t.id){new URLSearchParams(t.value).forEach(((t,r)=>{""===t?e.append("q",r):e.append(r,t)}))}else"refreshCache"===t.id?t.checked&&e.append("refreshCache",!0):"source"===t.name?t.checked&&e.append("source",t.value):e.append(t.id,t.value)})),e.toString()},v=s=>{log.info("- qs2form(qs)"),log.info(`  - qs: ${s}`);const a=new URLSearchParams(s);if(a.delete("refreshCache"),a.has("grid")){"small"===a.get("grid")&&(u=100)}let n=[];a.forEach(((e,s)=>{if(r.notq.includes(s)){if("source"===s){t("input[name=source]").forEach((t=>{t.value===e&&(t.checked=!0)}))}}else e?"q"===s?n.push(e):n.push(`${s}=${e}`):n.push(s)})),e("#q").value=n.join("&")},$=e=>{log.info("- updateUrl(qs)"),log.info(`  - qs: ${e}`),history.pushState("",null,`?${e}`)},L=async function(e){log.info("- getImages(qs)"),log.info(`  - qs: ${e}`);const t=new URLSearchParams(e),s=t.get("source");["source","grid"].forEach((e=>t.delete(e))),t.forEach(((e,r)=>{e||(t.set("q",r),t.delete(r))}));const a=new URLSearchParams(t.toString()),n=new URLSearchParams(t.toString());a.forEach(((e,t)=>{r.validZenodo.includes(t)||a.delete(t)})),n.forEach(((e,t)=>{r.validZenodeo.includes(t)||n.delete(t)}));const o=[],i={resource:"images",queryString:a.toString()},c={resource:"treatmentimages",queryString:`${n.toString()}`};"all"===s?o.push(q(i),q(c)):"Zenodo"===s?o.push(q(i)):"treatments"===s&&o.push(q(c));const l=t.get("page"),d=t.get("size");Promise.all(o).then((e=>{const t={prev:l>1?l-1:1,next:parseInt(l)+1,size:d,count:0,recs:[]};return e.forEach((e=>{void 0!==e&&(t.recs.push(...e.recs),t.count+=e.count,t.cacheHit=e.cacheHit)})),t})).then((t=>{const r=[];t.recs.forEach((e=>{const t=b({figureSize:u,treatmentId:e.treatmentId,title:e.title,zenodoRec:e.zenodoRec,uri:e.uri,caption:e.caption});r.push(t)})),S({figureSize:u,figures:r,qs:e,count:t.count,prev:t.prev,next:t.next,cacheHit:t.cacheHit})}))},q=async({resource:e,queryString:t})=>{log.info("- getResource()"),log.info(`  - resource: ${e}`),log.info(`  - queryString: ${t}`);const s=`${O.zenodeo3Uri}/${e}?${t}`,a=await fetch(s);if(a.ok){const t=await a.json(),s=t.item.result.records,n={count:0,recs:[],prev:"",next:"",cacheHit:t.cacheHit||!1};if(s)return n.count=n.count+t.item.result.count,s.forEach((t=>{if("images"===e){let e="/img/kein-preview.png";"thumbs"in t.links&&(e=t.links.thumbs[u]),n.recs.push({treatmentId:"",title:t.metadata.title,zenodoRec:t.id,uri:e,caption:t.metadata.description})}else if("treatmentimages"===e){const e=t.httpUri.split("/")[4],s=t.httpUri.indexOf("zenodo")>-1?`${r.zenodoUri}/${e}/thumb${u}`:t.httpUri;n.recs.push({treatmentId:t.treatmentId,title:t.treatmentTitle,zenodoRec:t.zenodoDep,uri:s,caption:t.captionText})}})),n}else alert("HTTP-Error: "+a.status)},b=({figureSize:e,treatmentId:t,title:s,zenodoRec:a,uri:n,caption:o})=>{let i="";a&&(i=`<a href="${r.zenodoUri}/${a}" target="_blank">more on Zenodo</a><br></br>`);let c="",l="";t&&(c=`<div class="treatmentId reveal" data-reveal="${t}">T</div>`,l=`<a href="${r.tbUri}/${t}" target="_blank">more on TreatmentBank</a>`);const d=`<img src="/img/bug.gif" width="${e}" data-src="${n}" class="lazyload" data-recid="${t}" onerror="${`this.onerror=null; setTimeout(() => { this.src='${n}' }, 1000);`}">`;let g="";l?g=`<a href="${r.tbUri}/${t}" target="_blank">${d}</a>`:i&&(g=`<a href="${r.zenodoUri}/${a}" target="_blank">${d}</a>`);let h="noblock";return 250===e&&(h="visible"),`<figure class="figure-${e} ${t?"tb":""}">\n    <div class="switches">\n        ${c}\n        <div class="close"></div>\n    </div>\n    ${g}\n    <figcaption class="${h}">\n        <a class="transition-050">Zenodo ID: ${a}</a>\n        <div class="closed">\n            <b class="figTitle">${s}</b><br>\n            ${o}<br>\n            ${i}\n            ${l}\n        </div>\n    </figcaption>\n</figure>`},S=({figureSize:t,figures:r,qs:s,count:a,prev:n,next:o,cacheHit:i})=>{log.info("- renderPage()"),log.info(`  - figureSize: ${t}px`),log.info(`  - figures: ${r.length} figures`),log.info(`  - qs: ${s}`),log.info(`  - count: ${a}`),log.info(`  - prev: ${n}`),log.info(`  - next: ${o}`),e("#grid-images").classList.add(`columns-${t}`),k(r,s,n,o),C(s,a,i)},k=(r,s,a,n)=>{log.info("- renderFigures()"),r.length?(e("#grid-images").innerHTML=r.join(""),z(s,a,n)):e("#grid-images").innerHTML='<p class="nada">sorry, no images found</p>',e("#throbber").classList.add("nothrob"),(()=>{const e=t("figcaption > a");for(let t=0,r=e.length;t<r;t++)e[t].addEventListener("click",h)})(),(()=>{const e=t("figure .reveal");for(let t=0,r=e.length;t<r;t++)e[t].addEventListener("click",g)})()},z=(t,r,s)=>{log.info("- renderPager()"),log.info(`  - qs: ${t}`),log.info(`  - prev: ${r}`),log.info(`  - next: ${s}`);const a=new URLSearchParams(t);a.delete("page"),e("#pager").innerHTML=`<a href="?${a.toString()}&page=${r}">prev</a> <a href="?${a.toString()}&page=${s}">next</a>`,e("#pager").classList.add("filled"),log.info("- listeners.addListenersToPagerLinks()")},C=(t,s,a)=>{if(log.info("- renderSearchCriteria(qs, count)"),log.info(`  - qs: ${t}`),log.info(`  - count: ${s}`),!s)return;const n=new URLSearchParams(t);n.get("page"),n.get("size");const o=[];let i;r.notInSearchCriteria.forEach((e=>n.delete(e))),n.forEach(((e,t)=>{let r;r="q"===t?`<span class="crit-key">${e}</span> is in the text`:"keywords"===t?`<span class="crit-key">keyword</span> is <span class="crit-val">${e}</span>`:`<span class="crit-key">${t}</span> is <span class="crit-val">${e}</span>`,o.push(r)}));const c=o.length;i=1===c?o[0]:2===c?`${o[0]} and ${o[1]}`:`${o.slice(0,c-2).join(", ")}, and ${o[c-1]}`;i=`about <span class="crit-count">${s-s%5}</span> records found where ${i}`,i+=a?'<span aria-label="cache hit" data-pop="top" data-pop-no-shadow data-pop-arrow>💥</span>':"",e("#search-criteria").innerHTML=i};log.level=log[O.loglevel];const E=()=>{let e=new URL(location).search;e?("?"===e.substring(0,1)&&(e=e.substring(1)),(e=>{log.info("case3(qs)"),log.info(`- qs: ${e}`),p(),v(e),L(e)})(e)):p()};export{E as init};
