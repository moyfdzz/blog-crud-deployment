let mongoose = require('mongoose');
let uuid = require('uuid/v4');


mongoose.Promise = global.Promise;

let commentCollection = mongoose.Schema({
    id: typeof uuid(),
    titulo: String,
    autor: String,
    contenido: String,
    fecha: Date
});

let Comment = mongoose.model('comment', commentCollection);

let CommentController = {
    getAll: function() {
        return Comment.find()
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    getByAuthor: function(autor) {
        return Comment.find({autor: autor})
            .then(comments => {
                return comments;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    getById: function(id) {
        return Comment.findById(id)
            .then(comment => {
                return comment;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    create: function(nuevoComentario) {
        return Comment.create(nuevoComentario)
            .then(nc => {
                return nc;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    delete: function(id) {
        return Comment.findByIdAndRemove(id)
            .then(rc => {
                return rc;
            })
            .catch(error => {
                throw Error(error);
            });
    },
    update: function(id, nuevoComentario) {
        return Comment.findByIdAndUpdate(id, nuevoComentario)
            .then(uc => {
                return uc;
            })
            .catch(error => {
                throw Error(error);
            });
    }
}

module.exports = {CommentController};