const mongoose = require('mongoose');
const {Schema}= mongoose;

const ProductosSchema = new Schema({
    nombre: {
        type:String,
        require:true
    },
    description: {
        type:String,
        require: true
    },
    proveedor: {
        type:String,
        require: true
    },
    precio_de_compra: {
        type:Number,
        require: true
    },
    precio_de_venta: {
        type:Number,
        require: true
    },

    filename: {type:String},
    pathdir:{type:String},
    originalname:{type:String},
    mimetype:{type:String},
    size:{type:Number},
  
    fecha: {
        type: Date,
        default:Date.now
    },
    usuario: {
        type: String
    }
});

module.exports = mongoose.model('Producto',ProductosSchema);