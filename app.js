//00 - Módulo nativo: no hay que instalarlo por fuera, ya viene integrado en node.js
const path = require("path"); //path: nos permite administrar rutas de archivos

//1- Invocamos express
const express = require('express');
const app = express();




//2- Seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'}); //donde van a estar nuestras variables de entorno

//4 - el directorio public y assets
app.use('/resources', express.static('public'));
app.use('/resources', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static('assets'));
app.use('/assets', express.static(path.join('_dirname', 'assets')));
//node_modules
app.use('/node_modules', express.static('node_modules'));

//JS FULL CALENDAR
app.use('/js', express.static('js'));
app.use('/js', express.static(path.join(__dirname, 'js')));
//Middleware para poder acceder a fullcalendar
app.use("/fullcalendar", express.static(path.join(__dirname, 'node_modules', 'fullcalendar')));


//5- establecer el motor de plantillas ejs
app.set('view engine', 'ejs');

//const bootstrap = require('bootstrap');

//6- Invocamos bcryptjs : hacer el hashing de password 
const bcryptjs = require('bcryptjs')

//7- Var. de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized: true
}))

// 8 - Invocamos al módulo de conexión de la BD
const connection = require("./database/db")

//9 - Establecemos rutas
app.get("/login", (req, res) => {  //RUTA LOGIN
    res.render('login.ejs');
});
app.get("/register", (req, res) => {  //RUTA register
    res.render('register.ejs');
});

//-------------TODO LO RELACIONADO AL LOGIN Y EL REGISTRO------------
//10 - Registración
app.post('/register', async (req, res) => {
    const user = req.body.user;
    const email = req.body.email;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    connection.query('INSERT INTO users SET ?',{
        user:user,
        email:email,
        pass:passwordHaash //Guarda el password de forma encriptada en la base de datos
    },
    async (error, results)=>{
        if(error){
            return console.log(error);
        }else{
            return res.render('register',{
                alert: true,
                alertTitle: 'Registro',
                alertMessage: '¡Te has registrado exitosamente!',
                alertIcon:'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            });
        }
    });
});

//11 - Autenticación
app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results) =>{
            //Si no coincide o no tiene longitud: usuario o pass incorrecto
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login.ejs',{
                    alert:true,
                    alertTitle:"Error",
                    alertMessage: "Contraseña y/o usuario incorrectos.",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta:'login'
                });
            }else {
                
                req.session.loggedin = true;
                req.session.user = results[0].id;
                res.render('login.ejs', {
                    alert:true,
                    alertTitle:" ¡Bienvenido!",
                    alertMessage: "Has iniciado sesión exitosamente.",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta:''
                });
            }
        })
    }else{
       
        res.render('login.ejs', {
            alert:true,
            alertTitle:" ¡Alerta!",
            alertMessage: "Por favor, ingrese un usuario y contraseña.",
            alertIcon: "warning",
            showConfirmButton: true,
            timer: false,
            ruta:'login'
        });
    }
})

//12- auth pages
app.get('/', (req, res) => {
    if(req.session.loggedin){
        connection.query('SELECT * FROM eventos WHERE user_id = ' + req.session.user,(error, result) => {
            if(error){
                return console.log(error);
            }else {
                req.session.eventos = result[0].id_evento;
                console.log(req.session.eventos);
                res.render('index.ejs', {
                    login: true,
                    result: result,
                });
                
            }

        })
} else {
        res.render('index.ejs',{
            login:false,        
        });
    }
});

// 13 - Logout

app.get('/logout', (req, res) => {
    req.session.destroy(()=>{
        res.redirect('/');
    });
});


//---------------EVENTOS-------------------

//1- insertamos en la base de datos
app.post('/create', async (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const date = req.body.date;
    const color = req.body.color;
    //console.log(req.session.user);
    connection.query('INSERT INTO eventos SET ?',{
        title:name,
        description: description,
        start:date,
        color: color,
        textColor: '#000000',
        user_id: req.session.user,
    },
    async (error, results) => {
        if(error){
            return console.log(error);
        } else {
            res.render('index.ejs', {
                login: true,
                alert:true,
                alertTitle:"Evento Registrado!",
                alertMessage: "Has registrado tu evento exitosamente",
                alertIcon: "success",
                showConfirmButton: true,
                timer: false,
                ruta:''
            });
        }

    });
});



//PARA EDITAR EVENTOS
app.post('/edit', async (req, res)=> {
    const id = req.body.id;
    console.log(id)
    const name1 = req.body.name1;
    const description1 = req.body.description1;
    const date1 = req.body.date1;
    const color1 = req.body.color1;
    connection.query('UPDATE eventos SET ? WHERE id_evento = ?',[{
        title: name1,
        description: description1,
        start: date1,
        color: color1,
        textColor:'#FFFFFF',
        user_id: req.session.user,
    }, id]
    , async (error, results) =>{
        if(error){
            throw error;
        }else {
            res.render('index.ejs', {
                login: true,
                alert:true,
                alertTitle:"Evento Editado!",
                alertMessage: "Has editado tu evento exitosamente",
                alertIcon: "success",
                showConfirmButton: true,
                timer: false,
                ruta:''
            });
        }
    });
 });




  // ELIMINAR EVENTOS
 app.get('/delete', async (req, res) =>{
    const id_evento = req.session.eventos;
     console.log(id_evento);
     
     connection.query('DELETE FROM eventos WHERE id_evento = ?',[id_evento], async (error, results)=>{
         if(error){
             throw error
         }else {
            res.render('index.ejs', {
                login: true,
                alert:true,
                alertTitle:"Evento Eliminado!",
                alertMessage: "Has eliminado tu evento exitosamente",
                alertIcon: "success",
                showConfirmButton: true,
                timer: false,
                ruta:''
            });
         }
     });
 }); 

app.listen(4000, (req,res) => {
    console.log('Server running in http://localhost:4000');
});