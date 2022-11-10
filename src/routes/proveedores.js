const { request, response } = require('express');
const express = require('express');
const router = express.Router();//modulo para routas 

const faker = require('faker');

//modelo de proveeedores de la db
const Proveedor = require('../model/Proveedores');
const { isAuthenticated } = require('../helpers/auth');


router.get('/proveedores/search',isAuthenticated,(req,res) =>{
    res.render('proveedores/search-proveedores');
})

router.post('/proveedores/search',isAuthenticated, async (req,res) =>{
    const search = req.body.search;
    if(search){
        await Proveedor.find({usuario: req.user._id, $text: {$search: search, $caseSensitive: false}})
        .sort({fecha: 'desc'})
        .exec( (err,proveedores) => {
            res.render('proveedores/search-proveedores',{
                proveedores,
                search
            });
        });
    }
});


router.get('/proveedores/add', isAuthenticated ,function(req,res){
    res.render('proveedores/new-proveedor.hbs');
});


router.get('/proveedores',isAuthenticated , async function(req,res){
   const proveedores =  await Proveedor.find({usuario: req.user._id}).lean().sort({fecha: 'desc'})
   res.redirect('/proveedores/1');
  /*await Proveedor.find({usuario: req.user._id}).lean().sort({fecha: 'desc'})
              .then( (proveedores)=>{
                res.render('/proveedores/1');
              })
              .catch( (err)=>{
                console.log(err);
                res.redirect('/error');
              });*/
});


router.get('/proveedores/delete:id', isAuthenticated , async function(req,res){
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1,len);

        const proveedor = await Proveedor.findByIdAndDelete(_id);
        req.flash('success_msg', 'Proveedor Eliminado Exitosamente');
        res.redirect('/proveedores/');
    }catch(err){
        response.send(404);
    }
});


//edit 
router.get('/proveedores/edit:id', isAuthenticated , async function(req,res) {
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1, len);//posiscion 1 en adelante, 0 son dos puntos
        const proveedor = await Proveedor.findById(_id);//_id
        _id = proveedor._id
        nombre = proveedor.nombre;
        telefono = proveedor.telefono;
        direccion = proveedor.direccion;
        codigo_postal = proveedor.codigo_postal;
        res.render('proveedores/editar-proveedor', {nombre,telefono,direccion,codigo_postal, _id})
    }catch(err){
        //res.send(404);
        res.redirect('/error'); 
    }
}); 

//editar 
router.put('/proveedores/editar-proveedor/:id', isAuthenticated , async function(req,res){
    //dejar el que esta en las diapositivas 
    const {nombre,telefono,direccion,codigo_postal} = req.body;
    await Proveedor.findByIdAndUpdate(req.params.id, {nombre,telefono,direccion,codigo_postal})
    req.flash('success_msg', 'Proveedor Actualizado Exitosamente');
    res.redirect('/proveedores');

    /*
    const {nombre,telefono,direccion,codigo_postal} = req.body;
    const errores=[];
    if(!nombre){
        errores.push({text:'Por Favor Ingresa El Nombre'});
    }
    if(!telefono){
        errores.push({text:'Por Favor Ingresa El Telefono'});
    }
    if(telefono.length < 10 || telefono.length > 12){
        errores.push({text:'El Telefono debe tener minimo 10 Caracteres y Maximo 12 Caracteres'});
    }
    if(!direccion){
        errores.push({text:'Por Favor Ingresa La Direccion'});
    }
    if(!codigo_postal){
        errores.push({text:'Por Favor Ingresa El Codigo Postal'});
    }
    if(codigo_postal.length < 5){
        errores.push({text:'El CP debe tener minimo 5 caracteres'});
    }
    if(errores.length > 0){
        res.render('proveedores/editar-proveedor', {
            errores,
            nombre,
            telefono,
            direccion,
            codigo_postal
        });
    }else {
        const {nombre,telefono,direccion,codigo_postal} = req.body;
        await Proveedor.findByIdAndUpdate(req.params.id, 
                        {nombre,telefono,direccion,codigo_postal})
                        .then ( ()=>{
                            req.flash('success_msg', 'Proveedor Actualizado Exitosamente');
                            res.redirect('/proveedores');
                        })
                        .catch( (err)=>{
                            console.log(err);
                            res.redirect('/error');
                        });
    }*/
});

//guardar 
router.post('/proveedores/new-proveedor', isAuthenticated , async function(req,res){
    const {nombre,telefono,direccion,codigo_postal}=req.body;
    const errores=[];
    if(!nombre){
        errores.push({text:'Por Favor Ingresa El Nombre'});
    }
    if(!direccion){
        errores.push({text:'Por Favor Ingresa La Direccion'});
    }
    if(errores.length > 0){
        res.render('proveedores/new-proveedor', {
            errores,
            nombre,
            direccion
        });
    }else {
        const nuevoProveedor = new Proveedor({nombre,telefono,direccion,codigo_postal});
        nuevoProveedor.usuario = req.user._id;
        await nuevoProveedor.save()  
                       .then ( ()=> {
                        req.flash('success_msg', 'Proveedor Agregado Exitosamente')
                        //lista de notas
                        res.redirect('/proveedores'); //res.redirect('/notes/consulta-notas')
                       })
                       .catch( (err)=>{
                        console.log(err);
                        res.redirect('/error');
                        })
         console.log(nuevoProveedor);
    }
});//fin guardar


//data false
router.get('/generate-fake-data', isAuthenticated, async (req,res) => {
    for(let i=0; i<30; i++){
         const newProveedor = new Proveedor();
         newProveedor.usuario = req.user._id;
         
         newProveedor.nombre = faker.random.word();
         newProveedor.telefono = faker.random.number();
         newProveedor.direccion = faker.random.words();
         newProveedor.codigo_postal = faker.random.number();
         await newProveedor.save();
     }
    res.redirect('/proveedores/');
 });

 
 router.get('/proveedores/:page',isAuthenticated, async (req,res) => {
     let perPage=6;
 
     let page =req.params.page || 1
 
     let numProveedor = (perPage*page)-perPage;
 
     await Proveedor.find({user: req.user._id})
     .sort({fecha: 'desc'})
     .skip(numProveedor)
     .limit(perPage)
     .exec( (err,  proveedores) => {
         Proveedor.countDocuments ({usuario: req.user._id}, (err, total) =>{
             if(err) 
             return next(err);
             if(total==0)
             pages = null;
             else 
             pages = Math.ceil(total/perPage);
             res.render('proveedores/consulta-proveedores',{
                 proveedores,
                 current: page,
                 pages: pages
             });
         })
     });
 });


module.exports = router; //para que se puedad usar en el index, SE EXPORTA (IMPORTANTE)
