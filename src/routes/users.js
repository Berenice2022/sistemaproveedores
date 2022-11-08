const { request} = require('express');
const express = require('express');
const router = express.Router();//modulo 
const passport = require('passport');

const Usuario = require('../model/Usuarios');

router.post('/users/signin', passport.authenticate('local',{
    successRedirect:'/proveedores',
    //successRedirect:'/productos',
    failureRedirect:'/users/signin',
    failureFlash:true
}));   

router.get('/users/signin', function(req,res){ 
   // res.send('Ingresa a la pagina');
    res.render('users/signin');
});

router.get('/users/signup', function(req,res){
   // res.send('Formulario de autenticacion');
    res.render('users/signup'); 
});

router.get('/users/logout', function(req,res){
    req.logout(function(err){
        if (err) {
            return next(err); }
            res.redirect('/');
    });
});

router.post('/users/signup', async function(req,res){
    const { nombre, email, password, confirmarpassword } = req.body;
    const errores= [];
    if(!nombre){
        errores.push({text:'Por favor inserta el nombre'});
    }
    if(!email){
        errores.push({text:'Por favor inserta el email'});
    }
    if(!password){
        errores.push({text:'Por favor inserta el password'});
    }
    if(password.length < 4){
        errores.push({text:'La contraseña debe tener al menos 4 caracteres'});
    }
    if(password != confirmarpassword){
        errores.push({text:'El passwor no coincide'});
    }
    if(errores.length > 0){
        res.render('users/signup', 
        {   errores,
            nombre, 
            email,
            password,
            confirmarpassword
        })
    }else {
        const emailUser = await Usuario.findOne({email: email});
        if (emailUser){
        errores.push({text: 'El email ya esta registrado, por favor registrar uno nuevo'});
        res.render('users/signup',
        {
            errores,
            nombre,
            email,
            password,
            confirmarpassword
        });
        return;
        }
          
       // res.send("ok");
       const newUser = new Usuario({
        nombre,
        email,
        password
       });
       newUser.password = await newUser.encryptPassword (password);
       console.log(newUser);
   //res.render('users/signup'); 
   await newUser.save()
                 .then( ()=>{
                    req.flash('success_msg', 'Usuario Registrado De Manera Exitosa');
                    res.redirect('/users/signin');
                 })
                 .catch( (err)=>{
                    console.log(err);
                    res.redirect('/error');
                 })
    }
 }); 

module.exports = router; //para que se puedad usar en el index, SE EXPORTA (IMPORTANTE)
