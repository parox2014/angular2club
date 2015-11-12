var express=require('express');
var os=require('os');
module.exports=function(server){
    var controllers=require('../controllers/controllers');

    server.get('/',function(req,res){
        res.render('index',{
            title:'angular2 club',
            system:os.type(),
            cpus:os.cpus(),
            totalmem:os.totalmem(),
            freemem:os.freemem(),
            platform:os.platform(),
            hostName:os.hostname()
        });
    });

    server.get('/unique',controllers.userCtrl.unique);

    server.post('/signup',controllers.userCtrl.signup);

    var userRouter=express.Router();

    userRouter.get('/active/:id',controllers.userCtrl.active);

    server.use('/user',userRouter);


};