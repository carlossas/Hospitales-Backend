var express = require('express');

var app = express();
//HOSPITAL
var Hospital = require('../models/hospital');
//MEDICO
var Medico = require('../models/medico');
//USUARIO
var Usuario = require('../models/usuario');


/////////////////////////////////////////////BUSQUEDA POR COLLECCION//////////////////////////////////////

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var promesa;
    //FUNCION DE JS QUE DEVUELVE UNA EXPRESION REGULAR,(VARIABLE Y STRING), PARA SER USADA DESPUES
    var regex = new RegExp(busqueda, 'i')


    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex)
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex)
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex)
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no valida' }
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});

///////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////BUSQUEDA EN TODAS LAS COLECCIONES///////////////////////////
app.get('/todo/:busqueda', (req, res, next) => {
    //BUSCA LOS PARAMETROS QUE SE ENVIARON POR LA URL :busqueda
    var busqueda = req.params.busqueda;
    //FUNCION DE JS QUE DEVUELVE UNA EXPRESION REGULAR,(VARIABLE Y STRING), PARA SER USADA DESPUES
    var regex = new RegExp(busqueda, 'i')


    //ESTA FUNCION DE ECS6 EJECUTA UN ARREGLO DE PROMESAS Y DEVUELVE UN THEN CUANDO SE TERMINAN DE EJECUTAR
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuario(busqueda, regex)
    ]).then(respuestas => { //ESTA RESPUESTA SE DEVUELVE EN EL MISMO ORDEN EN QUE FUERON ESCRITAS LAS PROMESAS

        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    })

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolved, reject) => {

        //FUNCION QUE BUSCA UN DATO DENTRO DEL CAMPO QUE SE LE INDIQUE
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err)
                } else {
                    resolved(hospitales)
                }

            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolved, reject) => {

        //FUNCION QUE BUSCA UN DATO DENTRO DEL CAMPO QUE SE LE INDIQUE
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err)
                } else {
                    resolved(medicos)
                }

            });

    });

}

function buscarUsuario(busqueda, regex) {

    return new Promise((resolved, reject) => {

        //FUNCION QUE BUSCA UN DATO DENTRO DEL CAMPO QUE SE LE INDIQUE
        Usuario.find({}, 'nombre email role')
            //AQUI SE EJECUTAN LOS CAMPOS EN LOS QUE DESEO QUE COINCIDA LA BUSQUEDA
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err)
                } else {
                    resolved(usuarios)
                }
            })
    });

}

module.exports = app;