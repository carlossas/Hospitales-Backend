var express = require('express');
//LIBRERIA DE EXPRESS PARA MANEJAR ARCHIVOS AL SERVIDOR
var fileUpload = require('express-fileupload');
//FILE SYSTEM DE NODE
var fs = require('fs');
var app = express();


//HOSPITAL
var Hospital = require('../models/hospital');
//MEDICO
var Medico = require('../models/medico');
//USUARIO
var Usuario = require('../models/usuario');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    //RECIBIMOS POR PARAMETROS
    var tipo = req.params.tipo;
    var id = req.params.id;

    //TIPOS DE COLECCION
    var tipoValido = ['hospitales', 'medicos', 'usuarios'];
    //ESTA FUNCION REGRESA UN -1 CUANDO NO ENCUENTRA EL ARCHIVO CON ESTA EXTENSION
    if (tipoValido.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no valido'
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No hay archivos seleccionados'
        });
    }

    //OBTENER NOMBRE DEL ARCHIVO
    var archivo = req.files.imagen;
    //GENERA UN ARRAY POR CADA PUNTO DEL NOMBRE DEL ARCHIVO
    var nombreCortado = archivo.name.split('.');
    //TOMO EL ULTIMO PUNTO Y EXTRAIGO LA EXTENSION DEL ARCHIVO
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //SOLO ACEPTAREMOS ESTAS EXTENSIONES
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']
        //ESTA FUNCION REGRESA UN -1 CUANDO NO ENCUENTRA EL ARCHIVO CON ESTA EXTENSION
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { message: 'Ingrese una imagen de tipo: ' + extensionesValidas.join(', ') }
        });
    }


    //NOMBE DE ARCHIVO PERSONALIZADO
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //MOVER EL ARCHIVO DE UN TEMPORAL A UN PATH DEL SERVIDOR
    var path = `./uploads/${ tipo }/${ nombreArchivo }`

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        //SI TODO SALIO BIEN
        subirPorTipo(tipo, id, nombreArchivo, res);


    })


});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return
                res.status(400).json({
                    ok: false,
                    mensaje: 'No exsite el usuario',
                });
            }

            //BUSCA SI EXISTE ALGUN PATH VIEJO O ANTERIOR
            var pathViejo = './uploads/usuarios/' + usuario.img;
            //SI EXSITE UN PATH VIEJO, LO ELIMINA 
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = 'k mira prro'
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    usuario: usuarioActualizado
                });

            })
        })

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return
                res.status(400).json({
                    ok: false,
                    mensaje: 'No exsite el medico',
                });
            }

            //BUSCA SI EXISTE ALGUN PATH VIEJO O ANTERIOR
            var pathViejo = './uploads/medicos/' + medico.img;
            //SI EXSITE UN PATH VIEJO, LO ELIMINA 
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    medico: medicoActualizado
                });

            })
        })

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return
                res.status(400).json({
                    ok: false,
                    mensaje: 'No exsite el hospital',
                });
            }

            //BUSCA SI EXISTE ALGUN PATH VIEJO O ANTERIOR
            var pathViejo = './uploads/hospitales/' + hospital.img;
            //SI EXSITE UN PATH VIEJO, LO ELIMINA 
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo)
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizada correctamente',
                    hospital: hospitalActualizado
                });

            })
        })

    }

}

module.exports = app;