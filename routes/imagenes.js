var express = require('express');
var app = express();
//FILE SYSTEM DE NODE
var fs = require('fs');
//PATH
const path = require('path')


app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    //DEVUELVE UN TRUE O FALSE SI EL DIRECTORIO DE LA IMAGEN EXISTE
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;