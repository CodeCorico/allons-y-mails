'use strict';

module.exports = function($done) {
  var path = require('path');

  if (
    (!process.env.MAILS_SENDMAIL || process.env.MAILS_SENDMAIL == 'true') &&
    (!process.env.MAILS_SMTP || process.env.MAILS_SMTP == 'true')
  ) {
    require(path.resolve(__dirname, 'models/mails-mail-model.js'))();
  }

  $done();
};
