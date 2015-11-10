var express=require('express');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var expressValidator=require('express-validator');
var MongoStore=require('connect-mongo')(session);
var mongoose=require('mongoose');
var path=require('path');
var config=require('./config');
var routes=require('./routes/routes');

var db=mongoose.connect(config.DATABASE,function(err,e){
    if(!err){
        console.log('数据库连接成功');
    }else{
        console.log(err.message);
    }
});



var server=express();

server.set('view engine',config.VIEW_ENGINE);

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

server.use(expressValidator());

server.use(express.static(path.join(__dirname, 'static')));

server.use(cookieParser());

server.use(session({
    secret:config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{maxAge:config.COOKIE_MAX_AGE},
    store:new MongoStore({ mongooseConnection: mongoose.connection })
}));


routes(server);


server.listen(config.PORT,function(){
    console.log('服务器启动成功！');
});

module.exports=server;
