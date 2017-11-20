/*
  Fichier     : controllers/reactions.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des reactions (like ou commentaire)
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Récupération des modeles Mongoose
var Comment = mongoose.model('Comment');
var Like = mongoose.model('Like');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

// Définition des fonctions exportables
module.exports = {
    
    // ******************************//
    // COMMENT
    // ******************************//
    comment:  function(author, body, source) {
        // On crée un commentaire            
        return Comment.create(
            { 
                body: body, 
                author: author,
                source : source
            }).then(function(comment) {
            // On ajoute le commentaire à la source
            source.item.comments.push(comment);
            source.item.nbComments += 1;
            source.item.save().then(function(item) {
                // On crée un evenement
                Event.newEvent('comment', user, 
                { 
                    kind: 'comment', 
                    item: comment 
                }, source).then(function() { return res.status(200).json(item); });
            });
        });
    },

    // ******************************//
    // UNCOMMENT
    // ******************************//
    uncomment:  function(author, comment, source) {
        // On supprime le commentaire
        return Comment.findByIdAndRemove(comment._id).then(function(){
            // On supprime le lien
            source.item.comments.remove(comment);
            source.item.nbComments -= 1;
            source.item.save().then(function(item) {
                // On crée un evenement
                Event.newEvent('uncomment', user, 
                { 
                    kind: 'comment', 
                    item: comment 
                }, source).then(function() {
                    // On renvoie un statut OK
                    return res.status(200).json(item);
                });
            });
        });
    },

    // ******************************//
    // LIKE
    // ******************************//
    like:  function(author, source) {
        // On crée un commentaire
        return Like.create(
            { 
                author: author,
                source: source
            }).then(function(like) {
            // On ajoute le like
            source.item.likes.push(like);
            source.item.nbLikes += 1;
            source.item.save().then(function(item) {
                // On crée un evenement
                Event.newEvent('like', user, 
                { 
                    kind: 'like', 
                    item: like 
                }, source).then(function() {
                    // On renvoie un statut OK
                    return res.status(200).json(item);
                });
            });
        });
    },

    // ******************************//
    // UNLIKE
    // ******************************//
    unlike:  function(author, like, source) {
        // On supprime le like
        return Like.findByIdAndRemove(like._id).then(function(){
            // On supprime le lien
            source.item.likes.remove(like);
            source.item.nbLikes -= 1;
            source.item.save().then(function(item) {
                // On crée un evenement
                Event.newEvent('unlike', user, 
                { 
                    kind: 'Like', 
                    item: like 
                }, source).then(function() {
                    // On renvoie un statut OK
                    return res.status(200).json(item);
                });
            });
        });
    },

}