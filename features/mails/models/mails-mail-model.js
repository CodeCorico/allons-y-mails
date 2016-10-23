'use strict';

module.exports = function() {
  DependencyInjection.model('$MailModel', function($allonsy) {

    var extend = require('extend'),
        fs = require('fs'),
        _templatesFiles = $allonsy.findInFeaturesSync('views/html/*-mailtemplate.html'),
        _templates = {},
        _isSendmail = process.env.MAILS_SENDMAIL && process.env.MAILS_SENDMAIL == 'true' || false,
        _from = _isSendmail ? process.env.MAILS_SENDMAIL_FROM : process.env.MAILS_SMTP_FROM,
        _sendmail = _isSendmail ? require('sendmail')({
          silent: true
        }) : null,
        _mailTransporter = _isSendmail ? null : require('nodemailer').createTransport({
          host: process.env.MAILS_SMTP_HOST,
          port: process.env.MAILS_SMTP_PORT,
          secure: process.env.MAILS_SMTP_SECURE && process.env.MAILS_SMTP_SECURE == 'true' || false,
          auth: {
            user: process.env.MAILS_SMTP_USER,
            pass: process.env.MAILS_SMTP_PASSWORD
          }
        });

    _templatesFiles.forEach(function(file) {
      var keys = file.split('-'),
          name = keys.length > 1 ? keys[keys.length - 2] : null;

      if (name) {
        _templates[name] = fs.readFileSync(file, 'utf-8');
      }
    });

    return function $MailModel(options) {

      var _this = this,
          _options = extend(true, {
            from: _from,
            template: 'default'
          }, options || {});

      this.from = function(value) {
        _options.from = value;

        return _this;
      };

      this.to = function(value) {
        _options.to = value;

        return _this;
      };

      this.subject = function(value) {
        _options.subject = value;

        return _this;
      };

      this.text = function(value) {
        _options.text = value;

        return _this;
      };

      this.i18n = function(values) {
        _options.i18n = values;

        return _this;
      };

      function _createHtml() {
        if (!_options.template || !_options.data) {
          return;
        }

        var html = _options.template;

        if (_options.i18n) {
          Object.keys(_options.i18n).forEach(function(key) {
            html = html.replace(new RegExp('\\[\\[' + key + '\\]\\]', 'g'), _options.i18n[key]);
          });
        }

        var data = extend(true, {
          subject: _options.subject,
          from: _options.from,
          to: _options.to
        }, _options.data);

        Object.keys(data).forEach(function(key) {
          html = html.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
        });

        html = html.replace(/{{.*?}}/g, '');

        _this.html(html);
      }

      this.template = function(value) {
        _options.template = value && _templates[value] || null;

        _createHtml();

        return _this;
      };

      this.data = function(data) {
        _options.data = data;

        _createHtml();

        return _this;
      };

      this.html = function(value, noText) {
        _options.html = value;

        if (!noText) {
          _options.text = value
            .replace(/(\n|\r)/gm, ' ')
            .replace(/(<style.*?<\/style>)/ig, '')
            .replace(/(<br.*?>)/ig, '\n')
            .replace(/(<([^>]+)>)/ig, '')
            .replace(/\s+/g, ' ');
        }

        return _this;
      };

      this.send = function(callback) {
        if (_isSendmail) {
          _sendmail(_options, callback);
        }
        else {
          _mailTransporter.sendMail(_options, callback);
        }

        return _this;
      };
    };

  });

};
