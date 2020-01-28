let express = require('express');
let morgan = require('morgan')
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
let uuid = require('uuid/v4');

let app = express();

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
    return res.status(200).json(comentarios);
});

// 7 b. GET /blog-api/comentarios-por-autor?autor=valor
app.get('/blog-api/comentarios-por-autor', jsonParser, (req,res) => {
    let autor = req.query.autor;

    if (autor === undefined) {
        res.statusMessage = 'Por favor introduzca un autor.';

        return res.status(406).send();
    }

    let comentariosPorA = comentarios.filter((comentario) => {
        if (comentario.autor === autor) {
            return comentario;
        }
    });
    
    if (comentariosPorA.length < 1) {
        res.statusMessage = 'El autor ingresado no tiene comentarios en el blog.';

        return res.status(404).send();
    }
    
    return res.status(200).json(comentariosPorA);
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
        id: uuid(),
        titulo: titulo,
        contenido: contenido,
        autor: autor,
        fecha: new Date()
    }

    comentarios.push(nuevoComentario);

    return res.status(201).send();
});

// 7 d. DELETE /blog-api/remover-comentario/:id
app.delete('/blog-api/remover-comentario/:id', jsonParser, (req,res)=>{
    let id = req.params.id;

    let comentario = comentarios.find((comentario) => {
        if (comentario.id === id) {
            return comentario;
        }
    });

    let indice = comentarios.findIndex(comentario => comentario.id === id);

    if (comentario === undefined) {
        res.statusMessage = 'El comentario ingresado no existe.';

        res.status(404).send();
    }

    comentarios.splice(indice, 1);

    return res.status(200).send();
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

    let foundComment = false;
    let comentarioActualizado;

    comentarios.forEach((comentario) => {
        if (comentario.id.toString() === idParametro) {
            foundComment = true;

            if (titulo !== undefined) {
                comentario.titulo = titulo;
            }

            if (contenido !== undefined) {
                comentario.contenido = contenido;
            }

            if (autor !== undefined) {
                comentario.autor = autor;
            }

            comentarioActualizado = comentario;
        }
    });

    if (!foundComment) {
        res.statusMessage = 'No existe un comentario con el id ingresado.';

        return res.status(404).send();
    }

    return res.status(202).send(comentarioActualizado);
});

app.listen(8080, () => {
    console.log('El servidor está corriendo en el puerto 8080.');
})