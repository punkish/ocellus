OCELLUS = (function (OCELLUS) {

    // var _private = my._private = my._private || {},
	// 	_seal = my._seal = my._seal || function () {
	// 		delete my._private;
	// 		delete my._seal;
	// 		delete my._unseal;
	// 	},
	// 	_unseal = my._unseal = my._unseal || function () {
	// 		my._private = _private;
	// 		my._seal = _seal;
	// 		my._unseal = _unseal;
    //     };

    const schema = {
        singles: {
            treatmentId: {
                default: '',
                rules: 'uuid'
            },
            format: {
                default: 'html',
                rules: 'string'
            },
            q: {
                default: '',
                rules: 'string'
            },
            refreshCache: {
                default: false,
                rules: ['boolean']
            },
            resultType: {
                default: 'treatments',
                rules: ['required', { 'in': ['treatments', 'images'] }]
            },
            page: {
                default: 1,
                rules: ['required', 'integer', 'min:1']
            },
            size: {
                default: 30,
                valid: ['required', 'integer', 'between:1,30']
            }
        },
        many: {
            community: {
                default: 'BLR',
                rules: ['required', { 'in': ['BLR', 'IceDig'] }]
            }
        }
    };

    OCELLUS.Urlcodec = {
        deconstruct: function(loc) {

            let qsParams = {
                singles: {},
                many: {}
            };

            let hrefArray = loc.substr(1).split('&').map(el => { return decodeURIComponent(el) });
            
            const singles = Object.keys(schema.singles);
            const many = Object.keys(schema.many);
            for (let i = 0, j = hrefArray.length; i < j; i++) {
                const [k, v] = hrefArray[i].split('=');

                if (singles.indexOf(k) !== -1) {
                    qsParams.singles[k] = v;
                }
                else if (many.indexOf(k) !== -1) {

                    if (qsParams.many[k]) {
                        qsParams.many[k].push(v);
                    }
                    else {
                        qsParams.many[k] = [v];
                    }

                }
            }

            return qsParams;

        },

        construct: function(k, v) {

            let url = '';
            let qsParams;

            if (location.search) {
                qsParams = this.deconstruct(location.search);
            }
            else {
                qsParams = {
                    singles: {},
                    many: {}
                }
            }

            const singles = Object.keys(schema.singles);
            const many = Object.keys(schema.many);
            if (singles.indexOf(k) !== -1) {
                qsParams.singles[k] = v;
            }
            else if (many.indexOf(k) !== -1) {

                if (k === 'community') {

                    // remove any existing "community" key
                    delete qsParams.many.community;
                    
                    if (v === 'all communities') {
                        
                        // add all the communities
                        qsParams.many.community = schema.many.community.rules[1].in
                    }
                    else {

                        //const urlFlagSelector = my.urlFlagSelector();
                        for (let i = 0, j = urlFlagSelector.length; i < j; i++) {

                            const element = urlFlagSelector[i];
                            
                            if (element.name === 'community') {
                                
                                if (element.checked) {

                                    if (qsParams.many.community) {
                                        qsParams.many.community.push(element.value);
                                    }
                                    else {
                                        qsParams.many.community = [element.value];
                                    }
                                    
                                }
                                else {
                                    if (qsParams.many.community) {
                                        const ic = qsParams.many.community.indexOf(element.value);
                                        if (ic !== -1) {
                                            qsParams.many.community.splice(ic, 1);
                                        }
                                    }
                                }

                            }
                    
                        }
                        
                    }
                }

            }

            let hrefArray = [];
            for (let key in qsParams.singles) {
                hrefArray.push(key + '=' + qsParams.singles[key]);
            }

            for (let key in qsParams.many) {
                const keyVals = qsParams.many[key];
                for (let i = 0, j = keyVals.length; i < j; i++) {
                    hrefArray.push(key + '=' + keyVals[i])
                }
            }

            console.log(qsParams);
            history.pushState('', '', '?' + hrefArray.join('&'))
            

        }
    };

    return OCELLUS;

}(OCELLUS || {}));