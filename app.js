//dependencias de express, generación de la app
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
var expressLayouts = require("express-ejs-layouts");

const app = express();

//la aplicación inicia un servidor y escucha las conexiones en el puerto 3000
app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//este analizador acepta cualquier codificación Unicode del cuerpo 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressLayouts);
app.use("/public", express.static(path.join(__dirname, "public")));

//direccionamiento a la ruta de inicio
app.get("/", (req, res) => {
    res.render("pages/home");
});

/*
//direccionamiento a la ruta de acerca de
app.get("/about", (req, res) => {
    res.render("pages/about")
});
*/

//direccionamiento a la ruta de contacto
app.get("/contact", (req, res) => {
    res.render("pages/contact")
});

//mandamos los valores que recibimos del formulario de contacto (nombre y correo), menos el mensaje
app.post('/contact', (req, res) =>{
    var name = req.body.name;
    var email = req.body.email;
    
    console.log('Nombre :' + req.body.name);
    console.log('Email :' + req.body.email);

    res.render('pages/contact_resp',{name, email});//nos manda los valores a la página de confirmación para ser desplegados
});

//direccionamiento a la ruta de información de CURP
app.get("/generator", (req, res) => {
    res.render("pages/generator")
});

//obtención de los datos que necesitamos para la creación del RFC, 
app.post('/home', (req, res) => {
    
    //datos personales del usuario,
    var name = req.body.name;
    var apat = req.body.apat;
    var amat = req.body.amat;
    var month = req.body.month;
    var day = req.body.day;
    var year = req.body.year;
    var gender = req.body.gender;
    var ent = req.body.ent;

    //converción del texto a mayúsculas, 
    name = name.toUpperCase();
    apat = apat.toUpperCase();
    amat = amat.toUpperCase();

    //constante de vocales
    const vocales = ["A", "E", "I", "O", "U"];

    //creación de filtros para la excepción de nombres
    function EX1 (nom) {
        quitar= new RegExp(/^(DA |DAS |DER |DI |DIE |DD |EL |LOS |LE |LES |MAC |MC |VAN |VON |Y |DE |DEL |LO |LOS |LA |LAS )+/);
        nombres=new RegExp(/^(MARIA |JOSE |MA |MA. |J |J.)/);
        nom=nom.replace(quitar,'');
        nom=nom.replace(nombres,'');
        nom=nom.replace(quitar,'');

        return nom;
    }

    name = EX1(name);

    //creación de filtro para la excepción de apellidos
    function EX2 (apellido) {
        quitar= new RegExp(/^(DA |DAS |DER |DI |DIE |DD |EL |LOS |LE |LES |MAC |MC |VAN |VON |Y |DE |DEL |LO |LOS |LA |LAS )+/);
        apellido=apellido.replace(quitar,'');

        return apellido;
    }

    amat = EX2(amat);
    apat = EX2(apat);

    //apellido materno faltante
    function EX3 (apellido) {
        if (apellido == '') {
            apellido = 'X';
        }
        return apellido;
    }

    amat = EX3(amat);

    //función que encuentra la primer vocal del apellido
    function vocalPat(apat) {
        let counter = 0;
        for (let letra of apat) {
            if (vocales.includes(letra)) {
                apat = letra;
                break;
            }
        }
        return apat;
    }

    //función que agrega un 0 a la numeración del 1 al 9 en los meses
    function months (month) {
        if (month < 10) {
            month = '0'+ month;
        }
        return month;
    }

    //función que agrega un 0 a la numeración del 1 al 9 en los días
    function days (day) {
        if (day < 10) {
            day = '0'+ day;
        }
        return day;
    }

    //creación de la homoclave (3 letras aleatorias)
    function makeHomo(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    

     //desplegado de variables en terminal
    console.log(vocalPat(apat));
    console.log(amat);
    console.log(month);
    console.log(day);
    console.log(year);

    //formación de un arreglo para la obtención de la primera letra de cada palabra
    var nameI = name[0];
    var apatI = apat[0];
    var amatI = amat[0];

    var rfc = apatI + vocalPat(apat) + amatI + nameI + year[2] + year[3] + months(month) + days(day) + makeHomo(3);
    
    res.render('pages/mi_curp', {name, apat, amat, month, day, year, rfc});
});


app.get('/mi_curp', (req, res) => {
    res.render('pages/mi_curp')
});

//cuando el servidor esté listo, nos responderá con lo siguiente:
app.listen(app.get("port"), () => {
    console.log(`servidor en puerto ${app.get("port")}`)
});