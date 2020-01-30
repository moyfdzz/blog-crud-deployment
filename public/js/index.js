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
                    <p>${comment._id}</p>
                    <p><i>${new Date(comment.fecha)}</i></p>
                </div>
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

        let titulo = $('#titlePost').val();
        let autor = $('#authorPost').val();
        let contenido = $('#contentPost').val();

        if (titulo === '' || autor === '' || contenido === '') {
            alert('Por favor ingrese toda la información.');

            return;
        }

        $('#titlePost').val('');
        $('#authorPost').val('');
        $('#contentPost').val('');

        let newComment = {
            titulo: titulo,
            autor: autor,
            contenido: contenido
        }

        postComment(newComment);
    });

    $('#modifyComment').on('submit', function(event) {
        event.preventDefault();

        let id = $('#idModify').val();
        let titulo = $('#titleModify').val();
        let autor = $('#authorModify').val();
        let contenido = $('#contentModify').val();

        if (titulo === '' && autor === '' && contenido === '') {
            fetchComments();

            return;
        }

        $('#idModify').val('');
        $('#titleModify').val('');
        $('#authorModify').val('');
        $('#contentModify').val('');

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

        newComment.id = id;

        updateComment(newComment, id);
    });

    $('#deleteComment').on('submit', function(event) {
        event.preventDefault();

        let id = $('#idDelete').val();

        $('#idDelete').val('');
        
        deleteComment(id);
    });
}

function init() {
    fetchComments();
    watchForms();
}

init();