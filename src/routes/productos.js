const { request, response } = require('express');
const express = require('express');
const router = express.Router();//modulo para routas 
const {unlink} = require('fs-extra');
const path = require('path');

//const faker = require('faker');

//modelo de notas de la db
const Producto = require('../model/Productos');
const Proveedorearr = require('../model/Proveedores');
const { isAuthenticated } = require('../helpers/auth');

router.get('/productos/search',isAuthenticated,(req,res) =>{
    res.render('productos/search-productos');
})

router.post('/productos/search',isAuthenticated, async (req,res) =>{
    const search = req.body.search;
    if(search){
        await Producto.find({usuario: req.user._id, $text: {$search: search, $caseSensitive: false}})
        .sort({fecha: 'desc'})
        .exec( (err,productos) => {
            res.render('productos/search-productos',{
                productos,
                search
            });
        });
    }
});


router.get('/productos/add', isAuthenticated ,async function(req,res){
    const consultanombre = await Proveedorearr.find({usuario: req.user._id},{nombre:1, _id:0});
    const arreglo = [];             
    for (const llena in consultanombre) {                
      arreglo.push(consultanombre[llena]);
    } 
    //console.log(arreglo);

    res.render('productos/new-producto.hbs', {arreglo});
});
 

router.get('/productos',isAuthenticated , async function(req,res){
    /* const productos =  await Producto.find({usuario: req.user._id}).sort({fecha: 'desc'});
    res.redirect('/productos/1');*/
    await Producto.find({usuario: req.user._id}).lean().sort({fecha: 'desc'})
              .then( (productos)=>{
                res.render('productos/consulta-productos', {productos});
              }) 
              .catch( (err)=>{
                console.log(err);
                res.redirect('/error');
              });
});


router.get('/productos/delete:id', isAuthenticated , async function(req,res){
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1,len);

        const producto = await Producto.findByIdAndDelete(_id);
        unlink(path.resolve('./src/public/img/uploads/'+ producto.filename));
        req.flash('success_msg', 'Producto Eliminado Exitosamente');
        res.redirect('/productos/');
    }catch(err){
        response.send(404);
    }
});  
 

//edit 
router.get('/productos/edit:id', isAuthenticated , async function(req,res) {
    const consultanombre = await Proveedorearr.find({usuario: req.user._id},{nombre:1, _id:0});
    const arreglo = [];             
    for (const llena in consultanombre) {                
      arreglo.push(consultanombre[llena]);
    } 
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1, len);//posiscion 1 en adelante, 0 son dos puntos
        const producto = await Producto.findById(_id);//_id
       // console.log(_id);
        _id = producto._id
        nombre = producto.nombre;
        description = producto.description;
        proveedor = producto.proveedor;
        precio_de_compra = producto.precio_de_compra;
        precio_de_venta = producto.precio_de_venta;
        filename = producto.filename;
        res.render('productos/editar-producto', {nombre,description,proveedor,precio_de_compra,precio_de_venta,filename,arreglo, _id})
    }catch(err){
        //res.send(404);
        res.redirect('/error'); 
    }
   // res.render('notes/editar-nota'); 
}); 
 
//editar 
router.put('/productos/editar-producto/:id', isAuthenticated , async function(req,res){
    const {dato,image} = req.body;
  //  console.log(image);  
  //  console.log(dato);   
     if(!image){  
    unlink(path.resolve('./src/public/img/uploads/'+ dato));
    const {nombre,description,proveedor,precio_de_compra,precio_de_venta} = req.body;  
    const {filename}=req.file; 
   // console.log(filename);
    const producto = new Producto();
    producto.filename = req.file.filename;
 
    await Producto.findByIdAndUpdate(req.params.id, {nombre,description,proveedor,precio_de_compra,precio_de_venta,filename});
    req.flash('success_msg', 'Producto Actualizado Exitosamente');
    res.redirect('/productos'); 
}else{
     const {nombre,description,proveedor,precio_de_compra,precio_de_venta} = req.body;
     await Producto.findByIdAndUpdate(req.params.id, {nombre,description,proveedor,precio_de_compra,precio_de_venta})
     req.flash('success_msg', 'Producto Actualizado Exitosamente');
     res.redirect('/productos');
}
     
});
  
//guardar en la db
router.post('/productos/new-producto', isAuthenticated , async function(req,res){
    /*const producto = new Producto();
    producto.nombre = req.body.nombre;
    producto.description = req.body.description;
    producto.proveedor = req.body.proveedor;
    producto.precio_de_compra = req.body.precio_de_compra;
    producto.precio_de_venta = req.body.precio_de_venta;
    producto.filename = req.file.filename;
    producto.path = '/img/uploads/'+ req.file.filename;
    producto.originalname = req.file.originalname;
    producto.mimetype = req.file.mimetype;
    producto.size = req.file.size;
    await producto.save();
    res.redirect('/productos');*/

    const {nombre,description,proveedor,precio_de_compra,precio_de_venta}=req.body;
    const {filename,pathdir,originalname,mimetype,size}=req.file;
    const errores=[];
    if(!nombre){
        errores.push({text:'Por favor inserta el nombre'});
    }
    if(!description){
        errores.push({text:'Por favor inserta la descripcion'});
    }
    if(errores.length > 0){
        res.render('productos/new-producto', {
            errores,
            nombre,
            description
        });
    }else {
    const producto = new Producto();
    producto.filename = req.file.filename;
    producto.pathdir = '/img/uploads/' + req.file.filename;
    producto.originalname = req.file.originalname;
    producto.mimetype = req.file.mimetype;
    producto.size = req.file.size;
        const nuevoProducto = new Producto({
            nombre,
            description,
            proveedor,
            precio_de_compra,
            precio_de_venta,
            filename, 
            pathdir,
            originalname,
            mimetype,
            size
        });
        nuevoProducto.usuario = req.user._id;
        await nuevoProducto.save()  
                       .then ( ()=> {
                        req.flash('success_msg', 'Producto Agregado Exitosamente')
                        //lista de notas
                        res.redirect('/productos'); //res.redirect('/notes/consulta-notas')
                       })
                       .catch( (err)=>{
                        console.log(err);
                        res.redirect('/error');
                        })
         console.log(nuevoProducto);
       // res.send("ok");
    }
});//fin guardar

/*data false
router.get('/generate-fake-data', isAuthenticated, async (req,res) => {
    for(let i=0; i<30; i++){
         const newProducto = new Producto();
         newProducto.usuario = req.user._id;
         
         newProducto.nombre = faker.random.word();
         newProducto.description = faker.random.words();
         newProducto.proveedor = faker.random.words();
         newProducto.precio_de_compra = faker.random.numbers();
         newProducto.precio_de_venta = faker.random.numbers();
         await newProducto.save();
     }
    res.redirect('/productos/');
 });

 
 router.get('/productos/:page',isAuthenticated, async (req,res) => {
     let perPage=6;
 
     let page =req.params.page || 1
 
     let numProducto = (perPage*page)-perPage;
 
     await Proveedor.find({user: req.user._id})
     .sort({fecha: 'desc'})
     .skip(numProducto)
     .limit(perPage)
     .exec( (err,  productos) => {
         Producto.countDocuments ({usuario: req.user._id}, (err, total) =>{
             if(err) 
             return next(err);
             if(total==0)
             pages = null;
             else 
             pages = Math.ceil(total/perPage);
             res.render('productos/consulta-productos',{
                 productos,
                 current: page,
                 pages: pages
             });
         })
     });
 });*/

module.exports = router; //para que se puedad usar en el index, SE EXPORTA (IMPORTANTE)
