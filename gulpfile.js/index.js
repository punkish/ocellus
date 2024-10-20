const { parallel } = require('gulp');
const { gulp4index } = require('./gulp4index.js');
const { gulp4maps } = require('./gulp4maps.js');

exports.gulp4index = gulp4index;
exports.gulp4maps = gulp4maps;
exports.default = parallel(gulp4index, gulp4maps);