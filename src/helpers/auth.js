const helpers = {};

helpers.isAuthenticated = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('error_msg','No Autorizado');
        res.redirect('/users/signin');
    }
};

module.exports=helpers;