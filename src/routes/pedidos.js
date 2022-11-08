const { request, response } = require('express');
const express = require('express');
const router = express.Router();//modulo para routas 

//const faker = require('faker');

//modelo de notas de la db
const Pedido = require('../model/Pedidos');
const Productoarr = require('../model/Productos');
const Proveedorearr = require('../model/Proveedores');
const { isAuthenticated } = require('../helpers/auth');

router.get('/pedidos/search',isAuthenticated,(req,res) =>{
    res.render('pedidos/search-pedidos');
})

router.post('/pedidos/search',isAuthenticated, async (req,res) =>{
    const search = req.body.search;
    if(search){
        await Pedido.find({usuario: req.user._id, $text: {$search: search, $caseSensitive: false}})
        .sort({fecha: 'desc'})
        .exec( (err,pedidos) => {
            res.render('pedidos/search-pedidos',{
                pedidos,
                search
            });
        });
    }
});

router.get('/pedidos/add', isAuthenticated , async function(req,res){
    const nomprovee = await Proveedorearr.find({usuario: req.user._id},{nombre:1, _id:0});
    const arregloprovee = [];             
    for (const llenaprovee in nomprovee) {                
        arregloprovee.push(nomprovee [llenaprovee]);
    } 

    const nomproduc = await Productoarr.find({usuario: req.user._id},{nombre:1,precio_de_compra:1, _id:1});
    const arregloproduc = [];             
    for (const llenaproduc in nomproduc) {                
        arregloproduc.push(nomproduc[llenaproduc]);
    } 

    res.render('pedidos/new-pedido.hbs',{arregloprovee,arregloproduc});
});
 

router.get('/pedidos',isAuthenticated , async function(req,res){
    /* const pedidos =  await Pedidos.find({usuario: req.user._id}).sort({fecha: 'desc'});
    res.redirect('/pedidos/1');*/
    await Pedido.find({usuario: req.user._id}).lean().sort({fecha: 'desc'})
              .then( (pedidos)=>{
                res.render('pedidos/consulta-pedidos', {pedidos});
              })
              .catch( (err)=>{
                console.log(err);
                res.redirect('/error');
              });
});


router.get('/pedidos/delete:id', isAuthenticated , async function(req,res){
    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1,len);

        const pedido = await Pedido.findByIdAndDelete(_id);
        req.flash('success_msg', 'Pedido Eliminado Exitosamente');
        res.redirect('/pedidos/');
    }catch(err){
        response.send(404);
    }
});


//edit notas
router.get('/pedidos/edit:id', isAuthenticated , async function(req,res) {
    const nomprovee = await Proveedorearr.find({usuario: req.user._id},{nombre:1, _id:0});
    const arregloprovee = [];             
    for (const llenaprovee in nomprovee) {                
        arregloprovee.push(nomprovee [llenaprovee]);
    } 

    const nomproduc = await Productoarr.find({usuario: req.user._id},{nombre:1, _id:0});
    const arregloproduc = [];             
    for (const llenaproduc in nomproduc) {                
        arregloproduc.push(nomproduc[llenaproduc]);
    } 

    try{
        var _id = req.params.id;
        var len = req.params.id.length;
        _id = _id.substring(1, len);//posiscion 1 en adelante, 0 son dos puntos
        const pedido = await Pedido.findById(_id);//_id
       // console.log(_id);
        _id = pedido._id
        producto = pedido.producto;
        proveedor= pedido.proveedor;
        cantidad_de_piezas = pedido.cantidad_de_piezas;
        costo_total = pedido.costo_total;
        res.render('pedidos/editar-pedido', {producto, proveedor,cantidad_de_piezas,costo_total, _id, arregloprovee,arregloproduc})
    }catch(err){
        //res.send(404);
        res.redirect('/error');
    }
   // res.render('notes/editar-nota');
}); 

//editar 
router.put('/pedidos/editar-pedido/:id', isAuthenticated , async function(req,res){
    //dejar el que esta en las diapositivas 
    const {producto, proveedor,cantidad_de_piezas,costo_total} = req.body;
    const errores=[];
    if(!producto){
        errores.push({text:'Por favor inserta el producto'});
    }
    if(!proveedor){
        errores.push({text:'Por favor inserta el proveedor'});
    }
    if(errores.length > 0){
        res.render('pedidos/editar-pedido', {
            errores,
            producto,  
            proveedor 
        });
    }else {
        const {producto,proveedor,cantidad_de_piezas} = req.body;
        const totales = await Productoarr.findOne({nombre:producto},{precio_de_compra:1, _id:0});
        const toprec = totales.precio_de_compra;
        const costo_total = toprec*cantidad_de_piezas;
        await Pedido.findByIdAndUpdate(req.params.id, 
                        {producto, proveedor,cantidad_de_piezas,costo_total})
                        .then ( ()=>{
                            req.flash('success_msg', 'Pedido actualizado correctamente');
                            res.redirect('/pedidos');
                        })
                        .catch( (err)=>{
                            console.log(err);
                            res.redirect('/error');
                        });
    }
});

//guardar notas en la db
router.post('/pedidos/new-pedido', isAuthenticated , async function(req,res){
    //console.log(req.body);
    const {producto, proveedor,cantidad_de_piezas}=req.body;
    const errores=[];
    if(!producto){
        errores.push({text:'Por favor inserta el producto'});
    }
    if(!proveedor){ 
        errores.push({text:'Por favor inserta el proveedor'});
    }
    if(errores.length > 0){
        res.render('pedidos/new-pedido', {
            errores,
            producto, 
            proveedor
        });
    }else {
         const totales = await Productoarr.findOne({nombre:producto},{precio_de_compra:1, _id:0});
        // console.log(totales);
         const toprec = totales.precio_de_compra;
         const costo_total = toprec*cantidad_de_piezas;

        const nuevoPedido= new Pedido({producto, proveedor,cantidad_de_piezas,costo_total});
        nuevoPedido.usuario = req.user._id;
        await nuevoPedido.save()  
                       .then ( ()=> {
                        req.flash('success_msg', 'Pedido agregado de manera exitosa')
                        //lista de notas
                        res.redirect('/pedidos'); //res.redirect('/notes/consulta-notas')
                       })
                       .catch( (err)=>{
                        console.log(err);
                        res.redirect('/error');
                        })
         console.log(nuevoPedido);
       // res.send("ok");
    }
});//fin guardar

/*data false
router.get('/generate-fake-data', isAuthenticated, async (req,res) => {
    for(let i=0; i<30; i++){
         const newPedido = new Pedido();
         newPedido.usuario = req.user._id;
         
         newPedido.producto = faker.random.words();
         newPedido.proveedor = faker.random.words();
         newPedido.cantidad_de_piezas = faker.random.numbers();
         newPedido.costo_total = faker.random.numbers();
         await newPedido.save();
     }
    res.redirect('/pedidos/');
 });

 
 router.get('/pedidos/:page',isAuthenticated, async (req,res) => {
     let perPage=6;
 
     let page =req.params.page || 1
 
     let numPedido = (perPage*page)-perPage;
 
     await Pedido.find({user: req.user._id})
     .sort({fecha: 'desc'})
     .skip(numPedido)
     .limit(perPage)
     .exec( (err,  pedidos) => {
         Pedido.countDocuments ({usuario: req.user._id}, (err, total) =>{
             if(err) 
             return next(err);
             if(total==0)
             pages = null;
             else 
             pages = Math.ceil(total/perPage);
             res.render('pedidos/consulta-pedidos',{
                 pedidos,
                 current: page,
                 pages: pages
             });
         })
     });
 });*/

module.exports = router; //para que se puedad usar en el index, SE EXPORTA (IMPORTANTE)
