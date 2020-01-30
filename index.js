let express = require('express');
let morgan = require('morgan')
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
let uuid = require('uuid/v4');
let mongoose = require('mongoose');

let app = express();
let {CommentController} = require('./model');
let {DATABASE_URL, PORT} = require('./config');

app.use(express.static('public'));
app.use(morgan('dev'));

app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");

        if (req.method === "OPTIONS") {
            return res.send(204);
        }
        
        next();
});

let comentarios = [{
    id: uuid(),
    titulo: "Muy buen blog",
    contenido: "Me gustó mucho tu blog, no puedo esperar al siguiente.",
    autor: "Victor",
    fecha: new Date()
},
{
    id: uuid(),
    titulo: "Un blog muy feo",
    contenido: "Ya no vuelvas a subir blogs. Gracias.",
    autor: "Carlos",
    fecha: new Date()
},
{
    id: uuid(),
    titulo: "Interesante blog",
    contenido: "Leí muchas veces este blog y me gustó mucho.",
    autor: "Erick",
    fecha: new Date()
},
{
    id: uuid(),
    titulo: "El mejor blog",
    contenido: "Me ecantó el blog.",
    autor: "Francisco",
    fecha: new Date()
}];

// 7 a. GET /blog-api/comentarios
app.get('/blog-api/comentarios', (req,res) => {
    CommentController.getAll()
        .then(comments => {
            return res.status(200).json(comments);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = 'Error 500: Database error.';
            return res.status(500).send();
        });
});

// 7 b. GET /blog-api/comentarios-por-autor?autor=valor
app.get('/blog-api/comentarios-por-autor', jsonParser, (req,res) => {
    let autor = req.query.autor;

    if (autor === undefined) {
        res.statusMessage = 'Por favor introduzca un autor.';

        return res.status(406).send();
    }

    CommentController.getByAuthor(autor)
        .then(aut => {
            return res.status(200).json(aut);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = 'Error 500: Database error.';
            return res.status(500).send();
        });
});

// 7 c. POST /blog-api/nuevo-comentario
app.post('/blog-api/nuevo-comentario', jsonParser, (req,res) => {
    let autor = req.body.autor;
    let contenido = req.body.contenido;
    let titulo = req.body.titulo;

    if (autor === undefined || contenido === undefined || titulo === undefined) {
        res.statusMessage = 'No se han proporcionado todos los elementos.';

        return res.status(406).send();
    }

    let nuevoComentario = {
        titulo: titulo,
        contenido: contenido,
        autor: autor,
        fecha: new Date()
    };

    CommentController.create(nuevoComentario)
        .then(nc => {
            return res.status(201).json(nc);
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = 'Error 500: Database error.';
            return res.status(500).send();
        });
});

// 7 d. DELETE /blog-api/remover-comentario/:id
app.delete('/blog-api/remover-comentario/:id', jsonParser, (req,res)=>{
    let id = req.params.id;

    CommentController.getById(id)
        .then(c => {
            CommentController.delete(id)
                .then(ru => {
                    return res.status(200).send();
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage = 'Error 500: Database error.';
                    return res.status(500).send();
                });
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = 'Error 500: Database error.';
            return res.status(500).send();
        });
});

// 7 e. PUT /blog-api/actualizar-comentario/:id
app.put('/blog-api/actualizar-comentario/:id', jsonParser, (req,res)=>{
    let idCuerpo = req.body.id;
    let idParametro = req.params.id;

    if (idCuerpo === undefined) {
        res.statusMessage = 'No se ingresó el id en el cuerpo.';

        return res.status(406).send();
    }

    if (idCuerpo !== idParametro) {
        res.statusMessage = 'El id del cuerpo no coincide con el id recibido como parámetro.';

        return res.status(409).send();
    }

    let titulo = req.body.titulo;
    let contenido = req.body.contenido;
    let autor = req.body.autor;

    if (titulo === undefined && contenido === undefined && autor === undefined) {
        res.statusMessage = 'No se cuenta con parámetros para actualizar';
        
        return res.status(406).send();
    }

    let comentarioActualizado = {};

    if (titulo !== undefined) {
        comentarioActualizado.titulo = titulo;
    }

    if (contenido !== undefined) {
        comentarioActualizado.contenido = contenido;
    }

    if (autor !== undefined) {
        comentarioActualizado.autor = autor;
    }

    CommentController.getById(idParametro)
        .then(c => {
            CommentController.update(idParametro, comentarioActualizado)
                .then(nc => {
                    res.status(202).json(nc);
                })
                .catch(error => {
                    console.log(error);
                    res.statusMessage = 'Error 404: El id no fue encontrado.';
                    return res.status(404).send();
                });
        })
        .catch(error => {
            console.log(error);
            res.statusMessage = 'Error 500: Database error.';
            return res.status(500).send();
        });
});

let server;

function runServer(port, databaseUrl) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, response => {
            if (response) {
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log("App is running on port " + port);
                    resolve();
                })
                    .on('error', err => {
                        mongoose.disconnect();
                        return reject(err);
                    })
            }
        });
    });
}

function closeServer() {
    return mongoose.disconnect()
        .then(() => {
            return new Promise((resolve, reject) => {
                console.log('Closing the server');
                server.close(err => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
}

runServer(PORT, DATABASE_URL);

module.exports = {app, runServer, closeServer};