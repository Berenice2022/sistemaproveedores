const mongoose = require('mongoose');
const {Schema}= mongoose;

const ProveedoresSchema = new Schema({
    nombre: {
        type:String,
        require:true
    },
    telefono: {
        type:String,
        require: true
    },
    direccion: {
        type:String,
        require: true
    },
    codigo_postal: {
        type:String,
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


module.exports = mongoose.model('Proveedor',ProveedoresSchema);