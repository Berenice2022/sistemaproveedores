const mongoose = require ('mongoose');//mongodb
require('dotenv').config();

const url = process.env.MONGODB_URL 
mongoose.connect(url)
        .then( ()=>{
            console.log("Conectada a la base de datos")
        })
        .catch( (err)=>{
             console.log(err);
})


/*mongoose.connect('mongodb://localhost/sistemaproveedoresdb')
.then(db=> console.log("Base de datos conectada"))
.catch(err => console.log(err));*/

