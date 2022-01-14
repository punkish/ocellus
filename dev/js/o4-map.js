if (typeof(O) === 'undefined' || typeof(O) !== 'object') O = {};

'use strict';

O.map = {
    map: L.map( 'map-target', {
        center: [0, 0],
        //minZoom: 0,
        zoom: 3
        // maxZoom: 18,
        // tileSize: 512,
        // zoomOffset: -1
    }),

    init: () => {
        L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        }).addTo( O.map.map );

        //const url = `${O.globals.zenodeo3Uri}/treatments?cols=latitude&cols=longitude&size=300000`;
        O.map.makeH3();
        O.map.info = L.control();

        // create a div with a class "info"
        O.map.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); 
            this.update();
            return this._div;
        };

        // this updates the control based on feature properties passed
        O.map.info.update = function (props) {
            const str = props ? `${props.density} in ${props.area} km<sup>2</sup>` : 'Hover over a hexagon to see how many';
            this._div.innerHTML = `<b>Treatments<sup>*</sup></b><br><small><sup>*</sup>one treatment may be represented by more than one point</small><br>${str}`;
        };

        const getUrl = (min_lat, min_lng, max_lat, max_lng) => {
            return `${O.globals.zenodeo3Uri}/treatments?location=containedIn({lowerLeft:{lat:${min_lat},lng:${min_lng}},upperRight:{lat:${max_lat},lng:${max_lng}}})&cols=latitude&cols=longitude&size=1000`;
        }

        O.map.info.addTo(O.map.map);
        O.map.map.on('moveend', function(e) {
            const zoom = O.map.map.getZoom();
            const bounds = O.map.map.getBounds();
            
            if (zoom > 5) {

                if (O.map.bounds) {
                    if (!O.map.bounds.contains(bounds)) {
                        O.map.bounds = bounds;
                        const min_lat = bounds.getSouthWest().lat;
                        const min_lng = bounds.getSouthWest().lng;
                        const max_lat = bounds.getNorthEast().lat;
                        const max_lng = bounds.getNorthEast().lng;

                        const url = getUrl(min_lat, min_lng, max_lat, max_lng);
                        O.map.getTreatments(url);
                    }
                }
                else {
                    O.map.bounds = bounds;
                    const min_lat = bounds.getSouthWest().lat;
                    const min_lng = bounds.getSouthWest().lng;
                    const max_lat = bounds.getNorthEast().lat;
                    const max_lng = bounds.getNorthEast().lng;

                    const url = getUrl(min_lat, min_lng, max_lat, max_lng);
                    O.map.getTreatments(url);
                }
            }
            else if (zoom <= 5) {
                O.map.map.removeLayer(O.map.layers.treatments);
                O.map.map.addLayer(O.map.layers.hexagons);
            }
        });
        //O.map.getTreatments(url);

        // O.map.map.locate({setView: true, maxZoom: 16});
        // O.map.map.on('locationfound', O.map.onLocationFound);
        // O.map.map.on('locationerror', O.map.onLocationError);
    },

    bounds: null,
    info: null,

    highlightFeature: (e) => {
        const layer = e.target;
    
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.8
        });
    
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        O.map.info.update(layer.feature.properties);
    },

    resetHighlight: (e) => {
        O.map.layers.hexagons.resetStyle(e.target);
        O.map.info.update();
    },

    onEachFeature: (feature, layer) => {
        layer.on({
            mouseover: O.map.highlightFeature,
            mouseout: O.map.resetHighlight,
            //click: zoomToFeature
        });
    },

    onLocationFound: (e) => {
        const radius = e.accuracy;
        const url = `${O.globals.zenodeo3Uri}/treatments?cols=latitude&cols=longitude&size=1000`;
        O.map.getTreatments(url);
    
        // L.marker(e.latlng).addTo(O.map.map)
        //     .bindPopup("You are within " + radius + " meters from this point").openPopup();
    
        // L.circle(e.latlng, radius).addTo(O.map.map);
    },

    onLocationError: (e) => {
        alert(e.message);
    },

    treatmentIcon: L.icon({ 
        iconUrl: '/img/treatment.png', 
        iconSize: [10, 10],
        iconAnchor: [0, 0],
        popupAnchor: [6, 5]
    }),

    getTreatments: async (url) => {
        const response = await fetch(url);
        
        // if HTTP-status is 200-299
        if (response.ok) {
            const json = await response.json();
            const records = json.item.result.records;

            //const h = records.map(r => new L.LatLng(r.latitude, r.longitude));
            //const heat = L.heatLayer(h, {radius: 25}).addTo(O.map.map);
  
            O.map.layers.treatments = L.markerClusterGroup();
            records.forEach((r, i) => {
                const url = `${O.globals.zenodeo3Uri}/treatments?treatmentId=${r.treatmentId}`;
                const marker = L.marker(
                    new L.LatLng(r.latitude, r.longitude), 
                    { 
                        title: i, 
                        icon: O.map.treatmentIcon 
                    })
                    .bindPopup(`treatmentId: <a href="${url}" target="_blank">${r.treatmentId}</a>`);

                O.map.layers.treatments.addLayer(marker);
            });

            O.map.map.removeLayer(O.map.layers.hexagons);
            O.map.map.addLayer(O.map.layers.treatments);
        }
    
        // throw an error
        else {
            alert("HTTP-Error: " + response.status)
        }
    },

    density: {'81be7ffffffffff':3057,'81a73ffffffffff':967,'81bebffffffffff':2273,'8108bffffffffff':776,'8109bffffffffff':1162,'8110bffffffffff':183,'81a87ffffffffff':753,'813cfffffffffff':1095,'818b3ffffffffff':1594,'818a3ffffffffff':956,'81673ffffffffff':372,'81407ffffffffff':5933,'8140bffffffffff':1419,'813c7ffffffffff':990,'81403ffffffffff':2099,'8140fffffffffff':1913,'8196bffffffffff':1991,'815f3ffffffffff':2649,'815e7ffffffffff':873,'818f7ffffffffff':1696,'811e3ffffffffff':2927,'811ebffffffffff':2398,'81cf3ffffffffff':186,'8166fffffffffff':6411,'817a7ffffffffff':2291,'8181bffffffffff':1669,'81453ffffffffff':1217,'8197bffffffffff':324,'81677ffffffffff':1038,'8166bffffffffff':3827,'816afffffffffff':1210,'818afffffffffff':2121,'818b7ffffffffff':2233,'816efffffffffff':599,'816d7ffffffffff':5506,'81417ffffffffff':5297,'81653ffffffffff':2357,'8168bffffffffff':665,'816d3ffffffffff':2720,'81693ffffffffff':533,'8182bffffffffff':957,'8182fffffffffff':737,'81a97ffffffffff':1526,'81b37ffffffffff':758,'81b27ffffffffff':400,'810dbffffffffff':201,'8126fffffffffff':301,'81447ffffffffff':935,'8108fffffffffff':966,'81113ffffffffff':706,'811efffffffffff':5646,'819c3ffffffffff':4495,'819d3ffffffffff':1320,'81a83ffffffffff':4924,'812b3ffffffffff':865,'812f7ffffffffff':1035,'8130fffffffffff':1133,'818a7ffffffffff':856,'81e67ffffffffff':14,'81283ffffffffff':1452,'81413ffffffffff':1222,'81603ffffffffff':1472,'81befffffffffff':1501,'812ebffffffffff':173,'8117bffffffffff':9,'812e3ffffffffff':581,'814b3ffffffffff':346,'811fbffffffffff':3265,'811f3ffffffffff':3451,'819f7ffffffffff':3171,'81a8fffffffffff':1714,'81387ffffffffff':611,'813f7ffffffffff':2595,'8165bffffffffff':2099,'814bbffffffffff':1368,'81687ffffffffff':1638,'819e3ffffffffff':640,'819b7ffffffffff':518,'819b3ffffffffff':180,'819efffffffffff':365,'8176bffffffffff':432,'819e7ffffffffff':234,'8172bffffffffff':629,'81947ffffffffff':1003,'81bc7ffffffffff':2832,'81973ffffffffff':1181,'81bcbffffffffff':269,'81a33ffffffffff':2748,'819a7ffffffffff':68,'819a3ffffffffff':117,'8177bffffffffff':208,'818dbffffffffff':451,'81a63ffffffffff':340,'8176fffffffffff':4,'8174bffffffffff':27,'8141bffffffffff':1661,'81aa3ffffffffff':78,'812cfffffffffff':1394,'811f7ffffffffff':249,'81197ffffffffff':373,'813c3ffffffffff':1382,'8149bffffffffff':3377,'81217ffffffffff':89,'81833ffffffffff':437,'81013ffffffffff':206,'8110fffffffffff':273,'811e7ffffffffff':1493,'81be3ffffffffff':4581,'81bf7ffffffffff':1928,'81b9bffffffffff':548,'81b93ffffffffff':911,'81c9bffffffffff':1083,'81757ffffffffff':599,'81dabffffffffff':1124,'819cfffffffffff':540,'814ebffffffffff':1,'814efffffffffff':2,'81303ffffffffff':161,'81b87ffffffffff':446,'814e7ffffffffff':61,'814f7ffffffffff':30,'81d8bffffffffff':160,'8154bffffffffff':238,'81733ffffffffff':95,'81737ffffffffff':69,'819cbffffffffff':2019,'8164bffffffffff':4658,'81643ffffffffff':1361,'81977ffffffffff':562,'816abffffffffff':339,'817abffffffffff':159,'8175bffffffffff':458,'81a23ffffffffff':4568,'81a3bffffffffff':1336,'81bcfffffffffff':2825,'8183bffffffffff':472,'81397ffffffffff':3299,'813e7ffffffffff':694,'81037ffffffffff':94,'81813ffffffffff':2256,'81a8bffffffffff':6568,'81803ffffffffff':2809,'81837ffffffffff':9,'81a37ffffffffff':1643,'81a2bffffffffff':1842,'81523ffffffffff':616,'8152fffffffffff':575,'81527ffffffffff':237,'8163bffffffffff':1514,'81683ffffffffff':1937,'81807ffffffffff':1166,'818abffffffffff':1792,'81667ffffffffff':666,'818bbffffffffff':1060,'81817ffffffffff':1385,'812c7ffffffffff':267,'81663ffffffffff':2834,'81647ffffffffff':11,'8167bffffffffff':326,'81b33ffffffffff':527,'81cfbffffffffff':156,'81cebffffffffff':1137,'8130bffffffffff':422,'81067ffffffffff':12,'81347ffffffffff':1127,'8131bffffffffff':582,'81393ffffffffff':4297,'81633ffffffffff':223,'81117ffffffffff':99,'81457ffffffffff':400,'815fbffffffffff':74,'812afffffffffff':316,'8144fffffffffff':1847,'816c7ffffffffff':358,'8114fffffffffff':70,'8195bffffffffff':94,'81483ffffffffff':999,'8148bffffffffff':904,'8142fffffffffff':144,'81c2fffffffffff':821,'8168fffffffffff':336,'81463ffffffffff':52,'8129bffffffffff':2478,'812c3ffffffffff':4260,'814cfffffffffff':1036,'817b7ffffffffff':657,'81317ffffffffff':499,'818f3ffffffffff':565,'81823ffffffffff':354,'8112fffffffffff':833,'81697ffffffffff':644,'81ba3ffffffffff':164,'81bb3ffffffffff':870,'81bb7ffffffffff':866,'815f7ffffffffff':858,'8126bffffffffff':744,'81a5bffffffffff':293,'81b83ffffffffff':196,'8158bffffffffff':1160,'81b2fffffffffff':754,'81213ffffffffff':171,'81a93ffffffffff':1426,'8164fffffffffff':71,'8148fffffffffff':1652,'8161bffffffffff':213,'8115bffffffffff':49,'8114bffffffffff':129,'8125bffffffffff':302,'81adbffffffffff':1073,'819d7ffffffffff':282,'81b8bffffffffff':239,'812d3ffffffffff':2594,'81253ffffffffff':595,'81257ffffffffff':492,'8124bffffffffff':175,'8124fffffffffff':334,'81243ffffffffff':672,'8120fffffffffff':495,'81247ffffffffff':135,'8120bffffffffff':1277,'81203ffffffffff':493,'81893ffffffffff':158,'8160bffffffffff':369,'813cbffffffffff':262,'813dbffffffffff':158,'8196fffffffffff':232,'81963ffffffffff':363,'816a7ffffffffff':239,'818e7ffffffffff':364,'8145bffffffffff':383,'813d3ffffffffff':977,'815d3ffffffffff':137,'812a3ffffffffff':984,'81487ffffffffff':840,'81007ffffffffff':25,'81497ffffffffff':23,'81ad3ffffffffff':744,'812dbffffffffff':2195,'8194fffffffffff':493,'819c7ffffffffff':436,'81b8fffffffffff':59,'81a7bffffffffff':947,'8135bffffffffff':109,'81187ffffffffff':451,'8118fffffffffff':185,'81343ffffffffff':96,'81353ffffffffff':77,'81a07ffffffffff':45,'814cbffffffffff':405,'81727ffffffffff':7,'8185bffffffffff':204,'81a27ffffffffff':370,'81a6bffffffffff':463,'81acbffffffffff':1458,'813efffffffffff':19,'812cbffffffffff':1283,'8194bffffffffff':470,'814fbffffffffff':12,'8172fffffffffff':720,'81433ffffffffff':1218,'81537ffffffffff':346,'81bfbffffffffff':295,'81ba7ffffffffff':234,'81777ffffffffff':16,'81d47ffffffffff':65,'812e7ffffffffff':528,'8104bffffffffff':13,'81a9bffffffffff':61,'81943ffffffffff':613,'812d7ffffffffff':871,'812bbffffffffff':583,'81743ffffffffff':103,'81437ffffffffff':357,'81423ffffffffff':195,'81ab3ffffffffff':81,'81207ffffffffff':624,'814b7ffffffffff':682,'8139bffffffffff':513,'813e3ffffffffff':44,'81d07ffffffffff':3,'81cb7ffffffffff':16,'8152bffffffffff':163,'81533ffffffffff':89,'812abffffffffff':1485,'81753ffffffffff':630,'815d7ffffffffff':1,'817b3ffffffffff':28,'81bc3ffffffffff':647,'81623ffffffffff':5,'817bbffffffffff':110,'81acfffffffffff':78,'817f7ffffffffff':4,'8173bffffffffff':177,'818c3ffffffffff':510,'81613ffffffffff':898,'818cfffffffffff':324,'8158fffffffffff':375,'81547ffffffffff':190,'81983ffffffffff':27,'81123ffffffffff':72,'810ebffffffffff':24,'81127ffffffffff':31,'8113bffffffffff':133,'810c3ffffffffff':54,'810c7ffffffffff':69,'818cbffffffffff':315,'81843ffffffffff':10,'8184fffffffffff':7,'81263ffffffffff':194,'81593ffffffffff':8,'81827ffffffffff':16,'817afffffffffff':380,'81b97ffffffffff':108,'81a43ffffffffff':316,'81427ffffffffff':202,'8189bffffffffff':10,'81597ffffffffff':12,'816bbffffffffff':151,'81167ffffffffff':45,'81c4bffffffffff':20,'81de7ffffffffff':32,'81b23ffffffffff':345,'815ebffffffffff':9,'81b2bffffffffff':55,'811bbffffffffff':19,'81df7ffffffffff':346,'8144bffffffffff':545,'818fbffffffffff':87,'81c37ffffffffff':120,'81443ffffffffff':934,'81313ffffffffff':83,'81a0fffffffffff':55,'81defffffffffff':7,'81ac7ffffffffff':40,'81987ffffffffff':19,'81d7bffffffffff':6,'8143bffffffffff':890,'8121bffffffffff':96,'812efffffffffff':284,'813f3ffffffffff':630,'81de3ffffffffff':22,'81c53ffffffffff':8,'81267ffffffffff':567,'81033ffffffffff':20,'814a3ffffffffff':230,'8169bffffffffff':185,'819f3ffffffffff':74,'8128bffffffffff':565,'8127bffffffffff':200,'81293ffffffffff':262,'81093ffffffffff':10,'81077ffffffffff':78,'8128fffffffffff':1236,'81cc7ffffffffff':14,'81cb3ffffffffff':61,'8162bffffffffff':37,'81383ffffffffff':235,'81e53ffffffffff':4,'81cabffffffffff':29,'81323ffffffffff':12,'8184bffffffffff':31,'81b6bffffffffff':14,'810a7ffffffffff':43,'8111bffffffffff':308,'8154fffffffffff':227,'8112bffffffffff':140,'810d7ffffffffff':203,'8106fffffffffff':26,'810cfffffffffff':42,'81137ffffffffff':12,'810e7ffffffffff':18,'810f7ffffffffff':28,'810d3ffffffffff':42,'81133ffffffffff':13,'81cbbffffffffff':29,'81ca3ffffffffff':26,'81dfbffffffffff':50,'81df3ffffffffff':480,'81143ffffffffff':34,'81183ffffffffff':104,'81a2fffffffffff':16,'81763ffffffffff':5,'819dbffffffffff':63,'8156bffffffffff':13,'81573ffffffffff':23,'81577ffffffffff':63,'8155bffffffffff':87,'8174fffffffffff':18,'81967ffffffffff':282,'81953ffffffffff':711,'81587ffffffffff':63,'81e73ffffffffff':8,'817a3ffffffffff':24,'8150bffffffffff':9,'81da3ffffffffff':78,'818e3ffffffffff':42,'81193ffffffffff':96,'8102fffffffffff':54,'81017ffffffffff':36,'8102bffffffffff':32,'81023ffffffffff':2,'81043ffffffffff':9,'81053ffffffffff':14,'81dd7ffffffffff':26,'81177ffffffffff':12,'81083ffffffffff':113,'81027ffffffffff':14,'81357ffffffffff':31,'81ee3ffffffffff':51,'810cbffffffffff':31,'81543ffffffffff':253,'8159bffffffffff':519,'815a7ffffffffff':7,'816a3ffffffffff':63,'816b3ffffffffff':48,'81003ffffffffff':38,'8100fffffffffff':17,'813ebffffffffff':18,'816b7ffffffffff':39,'81097ffffffffff':78,'81173ffffffffff':42,'815e3ffffffffff':38,'81853ffffffffff':18,'817c3ffffffffff':8,'81c23ffffffffff':131,'81c2bffffffffff':80,'81c33ffffffffff':178,'8153bffffffffff':107,'81557ffffffffff':2,'8122fffffffffff':209,'811d3ffffffffff':41,'81227ffffffffff':16,'8116bffffffffff':49,'81e47ffffffffff':14,'81f33ffffffffff':10,'81f3bffffffffff':5,'81e13ffffffffff':13,'81e17ffffffffff':9,'816ebffffffffff':9,'8198bffffffffff':5,'819bbffffffffff':44,'81b47ffffffffff':21,'81ee7ffffffffff':24,'81467ffffffffff':236,'810fbffffffffff':8,'810e3ffffffffff':8,'81277ffffffffff':344,'817d3ffffffffff':1,'811afffffffffff':19,'817d7ffffffffff':9,'8142bffffffffff':1,'816f3ffffffffff':10,'81b4fffffffffff':45,'819abffffffffff':3,'8187bffffffffff':3,'81617ffffffffff':236,'81857ffffffffff':7,'81d17ffffffffff':36,'812a7ffffffffff':36,'81493ffffffffff':15,'81993ffffffffff':29,'817cbffffffffff':5,'8178fffffffffff':5,'818c7ffffffffff':54,'8180bffffffffff':153,'81d6bffffffffff':65,'817dbffffffffff':7,'81a4bffffffffff':40,'81473ffffffffff':1,'8133bffffffffff':6,'81debffffffffff':122,'81bdbffffffffff':26,'81b4bffffffffff':67,'81a17ffffffffff':56,'813a7ffffffffff':7,'8186fffffffffff':55,'816dbffffffffff':26,'81063ffffffffff':10,'81657ffffffffff':104,'81957ffffffffff':218,'811a3ffffffffff':17,'81bafffffffffff':38,'81d1bffffffffff':4,'81ad7ffffffffff':27,'81e0bffffffffff':40,'81cd3ffffffffff':3,'813fbffffffffff':17,'81d8fffffffffff':2,'817cfffffffffff':5,'8118bffffffffff':7,'81107ffffffffff':53,'81d6fffffffffff':6,'81d63ffffffffff':1,'8134fffffffffff':22,'81773ffffffffff':10,'81c07ffffffffff':2,'811a7ffffffffff':6,'81583ffffffffff':70,'8101bffffffffff':16,'81dcfffffffffff':14,'81c0fffffffffff':9,'81dbbffffffffff':47,'8122bffffffffff':9,'811dbffffffffff':3,'81d9bffffffffff':3,'81e8bffffffffff':47,'81d0fffffffffff':8,'81e0fffffffffff':2,'810bbffffffffff':38,'8100bffffffffff':22,'81ed7ffffffffff':174,'81a03ffffffffff':21,'813b3ffffffffff':14,'819ebffffffffff':14,'81147ffffffffff':6,'81273ffffffffff':134,'81bbbffffffffff':7,'814a7ffffffffff':26,'81d77ffffffffff':5,'81eefffffffffff':12,'81ac3ffffffffff':14,'81c83ffffffffff':1,'8160fffffffffff':5,'81d87ffffffffff':3,'81883ffffffffff':4,'8146fffffffffff':8,'81da7ffffffffff':38,'811abffffffffff':11,'81db7ffffffffff':1,'81163ffffffffff':27,'814d7ffffffffff':23,'8134bffffffffff':13,'81a57ffffffffff':4,'8199bffffffffff':6,'81637ffffffffff':11,'81e5bffffffffff':5,'81b0fffffffffff':16,'81b1bffffffffff':2,'81b03ffffffffff':2,'814f3ffffffffff':8,'81d13ffffffffff':11,'81dcbffffffffff':4,'81b0bffffffffff':46,'815efffffffffff':5,'815b3ffffffffff':1,'812b7ffffffffff':6,'81ccfffffffffff':9,'81ef7ffffffffff':13,'81eebffffffffff':67,'81e57ffffffffff':3,'81f0bffffffffff':5,'81ed3ffffffffff':10,'81f03ffffffffff':2,'813abffffffffff':6,'810b3ffffffffff':3,'8157bffffffffff':5,'81ce3ffffffffff':66,'81afbffffffffff':2,'81af7ffffffffff':6,'81ae7ffffffffff':2,'818d3ffffffffff':1,'81d57ffffffffff':3,'81e9bffffffffff':1,'8119bffffffffff':15,'81aafffffffffff':1,'81847ffffffffff':12,'81607ffffffffff':6,'81327ffffffffff':4,'81153ffffffffff':14,'81867ffffffffff':9,'81723ffffffffff':10,'81c93ffffffffff':2,'81c57ffffffffff':6,'8178bffffffffff':13,'81ec3ffffffffff':15,'81ecbffffffffff':22,'81073ffffffffff':11,'8136bffffffffff':4,'81c1bffffffffff':7,'8138fffffffffff':19,'814abffffffffff':15,'810efffffffffff':47,'810f3ffffffffff':21,'811b3ffffffffff':18,'81157ffffffffff':21,'816cbffffffffff':3,'81aabffffffffff':7,'81223ffffffffff':1,'811d7ffffffffff':6,'81c13ffffffffff':8,'81c47ffffffffff':1,'81a13ffffffffff':10,'8179bffffffffff':1,'81cefffffffffff':13,'8132bffffffffff':6,'8192fffffffffff':1,'81997ffffffffff':10,'811cfffffffffff':1,'81c0bffffffffff':7,'81f27ffffffffff':14,'81b67ffffffffff':2,'81e1bffffffffff':1,'81eafffffffffff':15,'810b7ffffffffff':9,'8107bffffffffff':19,'812fbffffffffff':21,'81dc7ffffffffff':12,'81e8fffffffffff':9,'81563ffffffffff':16,'818ebffffffffff':3,'816cfffffffffff':26,'81937ffffffffff':1,'81567ffffffffff':2,'81233ffffffffff':2,'81d03ffffffffff':11,'81d0bffffffffff':4,'811c3ffffffffff':5,'813a3ffffffffff':10,'81b6fffffffffff':1,'81287ffffffffff':10,'81dafffffffffff':14,'817fbffffffffff':2,'81b3bffffffffff':20,'81103ffffffffff':4,'8104fffffffffff':9,'81b17ffffffffff':1,'81ca7ffffffffff':1,'81ef3ffffffffff':2,'8180fffffffffff':16,'8186bffffffffff':3,'81c67ffffffffff':7,'81b5bffffffffff':8,'811b7ffffffffff':11,'819fbffffffffff':11,'81d27ffffffffff':2,'817c7ffffffffff':22,'813afffffffffff':9,'81aa7ffffffffff':8,'81efbffffffffff':3,'8151bffffffffff':48,'812f3ffffffffff':9,'81367ffffffffff':3,'8132fffffffffff':3,'81edbffffffffff':2,'81e2fffffffffff':2,'81d93ffffffffff':1,'81e83ffffffffff':1,'81e23ffffffffff':1,'81d97ffffffffff':1,'81e87ffffffffff':1,'81e93ffffffffff':2,'81e2bffffffffff':1,'8156fffffffffff':34,'81f2bffffffffff':5,'81babffffffffff':2,'818d7ffffffffff':5,'81553ffffffffff':21,'8147bffffffffff':36,'8116fffffffffff':7,'817efffffffffff':3,'81c73ffffffffff':2,'8190fffffffffff':4,'81a6fffffffffff':2,'814e3ffffffffff':12,'81c43ffffffffff':4,'81c3bffffffffff':5,'815c3ffffffffff':5,'813d7ffffffffff':9,'81bd3ffffffffff':5,'815afffffffffff':38,'81ddbffffffffff':15,'81c03ffffffffff':19,'81b63ffffffffff':1,'81dc3ffffffffff':4,'81933ffffffffff':1,'810abffffffffff':11,'81513ffffffffff':39,'81aefffffffffff':1,'816e7ffffffffff':1,'81d73ffffffffff':5,'81e6bffffffffff':1,'8106bffffffffff':4,'818efffffffffff':4,'814dbffffffffff':1,'81503ffffffffff':28,'81b73ffffffffff':2,'81bd7ffffffffff':5,'81e6fffffffffff':4,'81c17ffffffffff':5,'81e03ffffffffff':4,'81297ffffffffff':2,'810a3ffffffffff':3,'81377ffffffffff':3,'8192bffffffffff':2,'81aebffffffffff':4,'81e63ffffffffff':1,'8188fffffffffff':12,'81517ffffffffff':1,'8105bffffffffff':10,'816c3ffffffffff':3,'81b7bffffffffff':1,'81707ffffffffff':2,'8170bffffffffff':2,'8170fffffffffff':2,'819afffffffffff':4,'81af3ffffffffff':1,'8137bffffffffff':1,'817f3ffffffffff':2,'81237ffffffffff':5,'817e3ffffffffff':1,'81cafffffffffff':2,'815b7ffffffffff':4,'81a1bffffffffff':1,'816e3ffffffffff':6,'81cd7ffffffffff':1,'81373ffffffffff':1,'81f17ffffffffff':1,'81927ffffffffff':11,'8150fffffffffff':2,'81897ffffffffff':2,'8103bffffffffff':5,'81e77ffffffffff':3,'813bbffffffffff':6,'8198fffffffffff':1,'8138bffffffffff':5,'81f0fffffffffff':1,'81e37ffffffffff':3,'815dbffffffffff':1,'81477ffffffffff':2,'81c77ffffffffff':1,'81abbffffffffff':2,'815cfffffffffff':8,'81d83ffffffffff':1,'813b7ffffffffff':13,'811cbffffffffff':2,'815c7ffffffffff':1,'81a47ffffffffff':1,'81a4fffffffffff':3,'8162fffffffffff':2,'81a53ffffffffff':3,'81e43ffffffffff':1,'814afffffffffff':1,'81c8bffffffffff':2,'81f2fffffffffff':1,'817ebffffffffff':1,'815abffffffffff':3,'8188bffffffffff':7,'814c3ffffffffff':2,'81923ffffffffff':1,'81873ffffffffff':1
},

    makeH3: () => {
        // const hexagon = {
        //     "type": "Feature",
        //     "properties": {},
        //     "geometry": {
        //       "type": "Polygon",
        //       "coordinates": [
        //         [
        //           [
        //             4.921875,
        //             9.795677582829743
        //           ],
        //           [
        //             25.6640625,
        //             10.833305983642491
        //           ],
        //           [
        //             30.585937499999996,
        //             30.14512718337613
        //           ],
        //           [
        //             22.148437499999996,
        //             43.83452678223682
        //           ],
        //           [
        //             0.703125,
        //             44.08758502824516
        //           ],
        //           [
        //             -7.03125,
        //             25.165173368663954
        //           ],
        //           [
        //             4.921875,
        //             9.795677582829743
        //           ]
        //         ]
        //       ]
        //     }
        // }

        const grid = {
            "type": "FeatureCollection",
            "features": []
        }

        const blackList = ['81033ffffffffff', '83f293fffffffff'];
        for (let [i, n] of Object.entries(O.map.density)) {
            if (!blackList.includes(i)){
                const hexagon = {
                    "type": "Feature",
                    "properties": {
                        "density": n
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": []
                    }
                }
    
                hexagon.geometry.coordinates.push([]);
                const coords = h3.h3ToGeoBoundary(i); // lat, lng
                
                coords.forEach((c) => {
                    hexagon.geometry.coordinates[0].push([c[1], c[0]]);
                })

                hexagon.properties.area = Math.round(h3.cellArea(i, h3.UNITS.m2) / 1000000);
                grid.features.push(hexagon);
            }
        }

        O.map.fixTransmeridian(grid);

        const style = function(feature) {
            const num = feature.properties.density;
            let fillColor = '';

            if (num >= 5775 &&  num < 6600) { fillColor = '#b10026' }
            else if (num >= 4950 &&  num < 5775) { fillColor = '#e31a1c' }
            else if (num >= 4125 &&  num < 4950) { fillColor = '#fc4e2a' }
            else if (num >= 3300 &&  num < 4125) { fillColor = '#fd8d3c' }
            else if (num >= 2475 &&  num < 3300) { fillColor = '#feb24c' }
            else if (num >= 1650 &&  num < 2475) { fillColor = '#fed976' }
            else if (num >= 825 &&  num < 1650) { fillColor = '#ffeda0' }
            else if (num >= 0 &&  num < 825) { fillColor = '#ffffcc' }

            return { 
                fillColor,
                color: 'grey',
                weight: 1,
                fillOpacity: 0.3
            };
        }

        O.map.layers.hexagons = L.geoJSON(grid, { 
            style,
            onEachFeature: O.map.onEachFeature
        }).addTo(O.map.map);
    },

    layers: {
        hexagons: null,
        treatments: null
    },

    // 510M sq kms
    

    // https://www.math.net/area-of-a-hexagon
    hexarea: (side) => 3 * Math.sqrt(3) * side * side / 2,

    output: (side, grid) => {
        const EARTH = 510000000;
        const area_of_hex = O.map.hexarea(side);
        console.log(`area of hexagon of side ${side} kms: ${area_of_hex}`);
        console.log(`number of hexagons to cover the earth: ${EARTH / area_of_hex}`);
        console.log(`num of hexagons generated by turf: ${grid.features.length}`);
    },

    fixTransmeridian: (feature) => {
        const {type} = feature;
        if (type === 'FeatureCollection') {
            feature.features.map(O.map.fixTransmeridian);
            return;
        }
        const {type: geometryType, coordinates} = feature.geometry;
        switch (geometryType) {
            case 'LineString':
                O.map.fixTransmeridianLoop(coordinates);
                return;
            case 'Polygon':
                O.map.fixTransmeridianPolygon(coordinates);
                return;
            case 'MultiPolygon':
                coordinates.forEach(O.map.fixTransmeridianPolygon);
                return;
            default:
                throw new Error(`Unknown geometry type: ${geometryType}`);
        }
    },
    
    fixTransmeridianCoord: (coord) => {
        const lng = coord[0];
        coord[0] = lng < 0 ? lng + 360 : lng;
    },
    
    fixTransmeridianLoop: (loop) => {
        let isTransmeridian = false;
        for (let i = 0; i < loop.length; i++) {
            // check for arcs > 180 degrees longitude, flagging as transmeridian
            if (Math.abs(loop[0][0] - loop[(i + 1) % loop.length][0]) > 180) {
                isTransmeridian = true;
                break;
            }
        }
        if (isTransmeridian) {
            loop.forEach(O.map.fixTransmeridianCoord);
        }
    },
    
    fixTransmeridianPolygon: (polygon) => {
        polygon.forEach(O.map.fixTransmeridianLoop);
    }
}