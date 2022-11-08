const express = require('express');
const router = express.Router();//modulo 

//http://localhost:3000/
router.get('/',function(req,res){
    //res.send('Index. Saludos ');
    res.render('index');
});

//http:localhost:3000/about
router.get('/about',function(req,res){
    //res.send('Acerca de...');
    res.render('about');
});

module.exports = router; //para que se puedad usar en el index, SE EXPORTA (IMPORTANTE)
