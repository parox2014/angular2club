'use strict';

const config=require('../config');
const mailer=require('nodemailer');
const transporter=mailer.createTransport({
    host:config.mail.HOST,
    port:config.mail.PORT,
    auth:{
        user:config.mail.USER,
        pass:config.mail.PASS
    }
});
const fs=require('fs');

const ejs=require('ejs');

let mailTemplate=fs.readFileSync('./views/mail/mail-active.ejs','utf-8');

exports.sendMail=function (options) {
    let defaults={
        from:`${config.SITE_NAME}<${config.mail.USER}>`
    };


    options=Object.assign(defaults,options);

    return  new Promise(function(resolve, reject) {
        transporter.sendMail(options,function (err,info) {
            if(err){
                reject(err);
            }else {
                resolve(info);
            }
        });
    });
};

exports.sendActiveMail=function (user) {
    var options={
        to:user.account,
        subject:`${config.SITE_NAME}帐号激活`
    };

    options.html=ejs.render(mailTemplate,{
            user:user,
            config:config
        });

    return exports.sendMail(options);
};

exports.sendRestMail=function (user) {

};
