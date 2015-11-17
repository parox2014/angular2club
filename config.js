const path=require('path');

const DB_NAME='angular2club';//数据库名
const DB_USER='angular2club';//数据库用户名
const DB_PWD='parox606';//数据库密码
const DB_URL='localhost/';//数据库地址

const config={
    HOST:'localhost',
    PORT:80,
    VIEW_ENGINE:'ejs',
    DATABASE:'mongodb://'+DB_USER+':'+DB_PWD+'@'+DB_URL+DB_NAME,
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
    },
    oAuth:{
        qq:{
            APP_ID:101268680,
            APP_KEY:'0bd1ac2e7948d03f0f75128239d71910',
            CALLBACK_URI:'http://test.angular2.club/user/auth/qq',
            HOST_NAME:'graph.qq.com',
            PATH_ACCESS_TOKEN:'/oauth2.0/token?',
            PATH_OPEN_ID:'/oauth2.0/me?',
            PATH_GET_USER_INFO:'/user/get_user_info?'
        },
        weChat:{

        },
        github:{
            APP_ID:'48796150f263a025b74b',
            APP_KEY:'d6744a1216fa4d097842b7c97967a22646794742',
            CALLBACK_URI:'http://test.angular2.club/user/auth/github',
            HOST_NAME:'github.com',
            PATH_ACCESS_TOKEN:'/login/oauth/access_token?',
            PATH_OPEN_ID:'/oauth2.0/me?',
            PATH_GET_USER_INFO:'/user/get_user_info?',
            SCOPE:['user']
        },
        microBlog:{
            APP_ID:4126929706,
            APP_KEY:'568324052c2ce439e5b7b7c4126d77e8'
        }
    },
    userType:{
        REG_BY_SELF:1,
        QQ:2,
        MICRO_BLOG:3,
        GITHUB:4,
        WE_CHAT:5
    },
    topicType:{
        SHARE:1,
        QUESTION:2,
        RECRUIT:3
    }
};
Object.freeze(config);
module.exports=config;
