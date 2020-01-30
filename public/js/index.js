// 9 a. Desplegar todos los comentarios.
function fetchComments() {
    let url = '/blog-api/comentarios';

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(responseJSON) {
            console.log(responseJSON);
            displayComments(responseJSON);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

// 9 b. Agregar un nuevo comentario.
function postComment(newComment) {
    let url = '/blog-api/nuevo-comentario';

    $.ajax({
        url: url,
        method: "POST",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(newComment),
        success: function(responseJSON) {
            console.log(responseJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status === 406) {
                alert('Hubo un error porque no se ingresaron los datos suficientes para publicar un comentario.');
            } else {
                alert('Hubo un error al intentar publicar el comentario.');
            }

            console.log(err);
        }
    });
}

// 9 c. Actualizar los datos de un comentario.
function updateComment(comment, id) {
    let url = `/blog-api/actualizar-comentario/${id}`;

    $.ajax({
        url: url,
        method: "PUT",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(comment),
        success: function(responseJSON) {
            console.log(responseJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status === 404) {
                alert('El id ingresado no existe.');
            }
            else if (err.status === 406) {
                alert('Hubo un error en los parámetros recibidos para actualizar el comentario.');
            } 
            else if (err.status === 409) {
                alert('Hubo un error en los parámetros recibidos para actualizar el comentario.');
            }

            console.log(err);
        }
    });
}

// 9 d. Remover un comentario.
function deleteComment(id) {
    let url = `/blog-api/remover-comentario/${id}`;

    $.ajax({
        url: url,
        method: "DELETE",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(responseJSON) {
            console.log(responseJSON);
            fetchComments();
        },
        error: function(err) {
            if (err.status === 404) {
                alert('El id ingresado no existe.');
            }

            console.log(err);
            fetchComments();
        }
    });
}

// 9 e. Desplegar comentarios por autor.
function fetchCommentsByAuthor(author) {
    let url = `/blog-api/comentarios-por-autor?autor=${author}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function(responseJSON) {
            console.log(responseJSON);
            displayComments(responseJSON);
        },
        error: function(err) {
            if (err.status === 404) {
                alert('No se encontraron autores con el nombre ingresado.');
            }
            else {
                alert('Hubo un error al tratar de buscar comentarios del autor ingresado.');
            }
            
            console.log(err);
        }
    });
}

// Desplegar los comentarios (Input: 9a y 9e).
function displayComments(responseJSON) {
    $('#commentsList').empty();

    responseJSON.forEach((comment) => {
        $('#commentsList').append(`
            <div class="commentPost">
                <div>
                    <h2>${comment.titulo}</h2>
                    <h4>Por ${comment.autor}</h4>
                    <p>${comment.contenido}</p>
                    <p><i>${new Date(comment.fecha)}</i></p>
                </div>
                <div>
                    <button value=${comment.id} class="editButton">Editar</button>
                    <button value=${comment.id} class="deleteButton">Borrar</button>
                </div>
            </div>
            <div class="editCommentContainer">
    
            </div>
        `);
    });
}

function watchForms() {
    $('#byAuthorSearch').on('submit', function(event) {
        event.preventDefault();

        let author = $('#nameAuthor').val();
        
        if (author === '') {
            fetchComments();
        }
        else {
            fetchCommentsByAuthor(author);
        }
    });
    
    $('#postComment').on('submit', function(event) {
        event.preventDefault();

        titulo = $('#title').val();
        autor = $('#author').val();
        contenido = $('#content').val();

        if (titulo === '' || autor === '' || contenido === '') {
            alert('Por favor ingrese toda la información.');

            return;
        }

        $('#title').val('');
        $('#author').val('');
        $('#content').val('');

        let newComment = {
            titulo: titulo,
            autor: autor,
            contenido: contenido
        }

        postComment(newComment);
    });

    $('#commentsList').on('submit', '.editComment', function(event) {
        event.preventDefault();

        let titulo = $('#titleEdit').val();
        let autor = $('#authorEdit').val();
        let contenido = $('#contentEdit').val();

        if (titulo === '' && autor === '' && contenido === '') {
            fetchComments();

            return;
        }

        let newComment = {};

        if (titulo !== '') {
            newComment.titulo = titulo;
        }

        if (autor !== '') {
            newComment.autor = autor;
        }

        if (contenido !== '') {
            newComment.contenido = contenido;
        }

        let id = $(this).parent().parent().find('.editButton').val();

        newComment.id = id;

        updateComment(newComment, id);
    });
}

function buttons() {
    $('#commentsList').on('click', '.editButton', function(event) {
        $(this).parent().parent().parent().find('.editCommentContainer').empty();
        $(this).parent().parent().parent().find('.editCommentContainer').append(`
            <form class="editComment">
                <div>
                    <label for="title">Título:</label>
                    <input type="text" id="titleEdit" name="titleEdit">
                </div>
                <div>
                    <label for="author">Autor:</label>
                    <input type="text" id="authorEdit" name="authorEdit">
                </div>
                <div>
                    <label for="content">Contenido:</label>
                    <textarea name="content" id="contentEdit" cols="70" rows="5"></textarea>
                </div>
                <button type="submit">Editar</button>
            </form>
`);
    });

    $('#commentsList').on('click', '.deleteButton', function(event) {
        let id = $(this).val();

        deleteComment(id);
    });
}

function init() {
    fetchComments();
    watchForms();
    buttons();
}

init();