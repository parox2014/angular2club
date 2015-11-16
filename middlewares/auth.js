'use strict';
const SIGNIN_URL='/signin';


exports.signinRequired=function (req,res,next) {
    if(req.session.user){
        next();
    }else{
        res.redirect(SIGNIN_URL);
    }
};

exports.adminRequired=function (req,res,next) {
    // body...
};


