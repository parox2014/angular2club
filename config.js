const path=require('path');

const config={
    HOST:'localhost',
    PORT:80,
    VIEW_ENGINE:'ejs',
    DATABASE:'mongodb://angular2club:root@localhost/angular2club',
    CDN:'',
    SITE_ICON:'',
    SITE_LOG:'',
    SITE_NAME:'Angular2 Club',
    SITE_DESC:'',
    SESSION_SECRET:'angular2club',
    COOKIE_MAX_AGE:60*60*1000,
    ONEAPM_KEY:'UFYEBAIDBQleb32RFVxFWlRKWx0270AOXx4CAgYFSd920QkLHQQLSgdU68f5UwYfAAoaA1Q=',
    mail:{
        HOST: 'smtp.163.com',
        PORT: 25,
        USER:'wdeagle@163.com',
        PASS:'dzh20091117'
    },
    upload:{
        PATH:path.join('/upload/'),
        URL:'/upload/'
    }
};

module.exports=config;
