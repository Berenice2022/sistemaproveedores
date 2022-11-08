const mongoose = require('mongoose');
const {Schema}= mongoose;

const PedidosSchema = new Schema({
    producto: {
        type:String,
        require:true
    },
    proveedor: {
        type:String,
        require: true
    },
    cantidad_de_piezas: {
        type:Number,
        require: true
    },
    costo_total: {
        type:Number,
        require: true
    },
    fecha: {
        type: Date,
        default:Date.now
    },
    usuario: {
        type: String
    }
});


module.exports = mongoose.model('Pedido',PedidosSchema);