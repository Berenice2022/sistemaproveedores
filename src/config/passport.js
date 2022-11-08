const passport = require('passport');
const LocalStragegy = require('passport-local').Strategy;

const Usuario = require('../model/Usuarios');

passport.use(new LocalStragegy(
    {
    usernameField: 'email'
    }, 
    async function(email, password, done){
    const usuario = await Usuario.findOne({email: email});
    if(!usuario){
        return done(null,false, {message: 'No Se Encontro El Usuario'});
    }else{
        const coincide = await usuario.matchPassword(password);
        if(coincide){
            return done(null, usuario);
        }else{
            return done(null, false, {message: 'Password Incorrecto'});
        }
    }
}
));

passport.serializeUser(function(usuario,done){
    done(null, usuario.id);
});

passport.deserializeUser(function(id,done){
    Usuario.findById(id, function(error, usuario){
        done(error,usuario);
    })
});