'use strict';
const SIGNIN_URL='./signin';


exports.signinRequired=function (req,res,next) {
    if(req.session.user){
        next();
    }else{
        console.log(req.xhr);
        if(req.xhr){
            res.set('X-Error','signin required');
            res.status(403).send({msg:'signin required'})
        }else{
            res.redirect(SIGNIN_URL);
        }
    }
};

exports.adminRequired=function (req,res,next) {
    // body...
};


