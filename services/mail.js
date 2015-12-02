'use strict';

const config = require('../config');
const mailer = require('nodemailer');
const transporter = mailer.createTransport({
  host: config.mail.HOST,
  port: config.mail.PORT,
  auth: {
    user: config.mail.USER,
    pass: config.mail.PASS,
  },
});
const fs = require('fs');

const ejs = require('ejs');

class Mail {
    /**
    *@description class mailservice
    *@params tplPath {String} template path
    *@params options {Object}
    *@params options.from {String} mail address
    *@params options.to {String} mail receiver
    *@params options.subject {String} mail title
    *@params options.html {String} mail content
    * */
    constructor(tplPath, options) {
      let defaults = {
        from: `${config.SITE_NAME}<${config.mail.USER}>`,
        to: '',
        subject: `${config.SITE_NAME}帐号激活`,
        html: '',
      };

      this._options = Object.assign(defaults, options);

      fs.readFile(tplPath, 'utf-8', (err, data)=> {
        this._template = data;
      });

    }

    /**
     * 发送邮件
     * @method sendMail
     * @param  {[Object]} data    [description]
     * @param  {[Object]} options [description]
     * @return {[Promise]}         [description]
     */
    sendMail(data, options) {
      options = Object.assign(this._options, options);

      data = data || {};

      options.html = ejs.render(this._template, data);

      return new Promise(function(resolve, reject) {
        transporter.sendMail(options, function(err, info) {
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
      });
    }
}

module.exports = Mail;
