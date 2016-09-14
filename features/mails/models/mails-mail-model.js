'use strict';

module.exports = function() {
  DependencyInjection.model('$MailModel', function($allonsy) {

    var extend = require('extend'),
        fs = require('fs'),
        nodemailer = require('nodemailer'),
        templatesFiles = $allonsy.findInFeaturesSync('views/html/*-mailtemplate.html'),
        templates = {},
        mailTransporter = nodemailer.createTransport({
          host: process.env.MAILS_HOST,
          port: process.env.MAILS_PORT,
          secure: process.env.MAILS_SECURE && process.env.MAILS_SECURE == 'true' || false,
          auth: {
            user: process.env.MAILS_USER,
            pass: process.env.MAILS_PASSWORD
          }
        });

    templatesFiles.forEach(function(file) {
      var keys = file.split('-'),
          name = keys.length > 1 ? keys[keys.length - 2] : null;

      if (name) {
        templates[name] = fs.readFileSync(file, 'utf-8');
      }
    });

    return function $MailModel(options) {

      var _this = this,
          _options = extend(true, {
            from: process.env.MAILS_FROM || null,
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
        _options.template = value && templates[value] || null;

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
        mailTransporter.sendMail(_options, callback);

        return _this;
      };
    };

  });

};
