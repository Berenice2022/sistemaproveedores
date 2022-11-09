const express = require('express'); 
const path = require('path');
const {engine} = require('express-handlebars');//handlebars
const methodOverride = require('method-override');//metodo como put, delete, etc
const session = require('express-session');
const flash = require('connect-flash');//mensajes de app
const passport = require('passport');

//heroku Mama123anita+

const morgan = require('morgan');
const multer = require('multer');
const {v4 : uuidv4} = require('uuid');
const { format } = require('timeago.js');

//Initalytation
const app = express();
require('./database');  
require('./config/passport');

//Settings
app.set('puerto', process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.engine('.hbs',engine({
    defaultLayout: 'main',
    defaultDir: path.join('views','layouts'),
    partialsDir: path.join(__dirname,'views','partials'),
    extname:'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault:true
    },
    
    helpers: {
        equal: function (lvalue, rvalue, options){
           
            if(lvalue != rvalue)
            return options.inverse(this);
            else
            return options.fn(this);
        },
        for: function(current, pages, options){
            current = Number(current);
            pages = Number(pages);

            var code='';
            var i = current> 3 ? current - 2 : 1;

            if(i !== 1){
                let last = i-1;
                code += '<li class="page-item mr-1">'
                     +  '<a href="/proveedores/'+ last+ '" class="page-link">...</a>'
                     +  '</li>';
            }

            for(;i < (current + 3 ) && i <= pages ; ++i){
                if(i==current){
                    code += '<li class="page-item active mr-1">'
                     +  '<a href="'+ i + '" class="page-link ">'+i+'</a>'
                     +  '</li>';
                }else{
                    code += '<li class="page-item mr-1">'
                    +  '<a href="/proveedores/'+ i + '" class="page-link">'+i+'</a>'
                    +  '</li>';
                }//else

                if(i == (current + 2) && i < pages){
                    let last = i+1;
                    code += '<li class="page-item mr-1">'
                    +  '<a href="/proveedores/'+ last+ '" class="page-link">...</a>'
                    +  '</li>';
                }//if
            }//for
            return options.fn(code);
        }//function for
    }//helpers

  }
));
app.set('view engine','hbs');

//Middleware
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));//delete, put, get, edit
app.use(session({//guardar variables de session
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());

//app.use(morgan('dev'));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/uploads'),
    filename: (req,file,cb,filename) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
app.use(multer({storage: storage}).single('image'));

   
//variables globals
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.usuario = req.user || null;
   // res.locals.format = req.format ;
    next();
});  

app.use((req,res,next) => { 
    app.locals.format = format ;
    next();
});


//routes
app.use(require('./routes/index'));
app.use(require('./routes/proveedores'));
app.use(require('./routes/productos'));
app.use(require('./routes/pedidos'));
app.use(require('./routes/users'));

//Static Files
app.use(express.static(path.join(__dirname,'public'))); 


//Server
app.listen(app.get('puerto'),function(){
    console.log('Server running on port 3000');
});