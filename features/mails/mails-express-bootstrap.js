'use strict';

module.exports = function($done) {
  var path = require('path');

  if (!process.env.MAILS || process.env.MAILS == 'true') {
    require(path.resolve(__dirname, 'models/mails-mail-model.js'))();
  }

  $done();
};
