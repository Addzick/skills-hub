/*
  Fichier     : controllers/comments.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion des commentaires
*/

// Importation des ressources externes
const auth = require('../config/auth');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Event = mongoose.model('event');
const Comment = mongoose.model('comment');

// Définition du controleur de base
class CommentCtrl {

    constructor() {}

    getOptionsFromRequest(req) {
        
         // On renvoie les options
         return opts;
    }

    preload(req, res, next) {
        // On recherche le commentaire correspondant
        return Comment
        .findOne({_id: mongoose.Types.ObjectId(req.params.comment)})
        .then(function(comment){
            // Si aucun commentaire trouvé, on renvoie une erreur 404
            if(!comment) { return res.sendStatus(404); }        
            // On remplit la requête avec le commentaire trouvé
            req.comment = comment;
            // On continue l'execution
            return next();
          }).catch(next);
    }

    findOne(req, res, next) {
        // On execute la requête de sélection et on renvoie le résultat
        return Comment
        .findOne({_id: mongoose.Types.ObjectId(req.params.comment)})
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ comment : item });
        }).catch(next);
    }

    findAll(req, res, next) {
        var query = {};
        var opts = { skip: 0, limit: 20, sort: { updatedAt: 'desc' } };
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }
        if(typeof req.query.source !== 'undefined' ) {
            query.source.item = { _id : mongoose.Types.ObjectId(req.query.source) };
        }        
        if(typeof req.query.sort !== 'undefined') {
            opts.sort = req.query.sort;
        }
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        }        
        
        return Promise.all([
            Comment
            .find(query, {}, opts)
            .exec(),
            Comment
            .count(query)
            .exec()
        ]).then(function(results){ 
            return res.status(200).json({ 
                comments: results[0],
                count: results[1]
            });
        }).catch(next);
    }

    comment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On crée un commentaire            
            return Comment.create({ 
                author: user,
                body: req.body.comment, 
                source: req.body.source
             }).then(function(comment) {                
                // On ajoute le commentaire à la source
                return mongoose.model(comment.source.kind)
                .findOneAndUpdate({ _id: mongoose.Types.ObjectId(comment.source.item) }, { $push: { comments: comment._id }, $inc: { nbComments : 1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ comment.source.kind }_commented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.status(200).json({ comment: comment });
                    });
                });
            });
        }).catch(next);
    }

    uncomment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été trouvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On supprime le commentaire
            return Comment.findByIdAndRemove(req.comment._id).then(function(comment) {
                // On supprime le lien avec la source
                return mongoose.model(comment.source.kind)
                .findOneAndUpdate({ _id: comment.source.item._id }, { $pull: { comments: comment }, $inc: { nbComments : -1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ comment.source.kind }_uncommented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('comment', this.preload);   
        router.get('/', auth.optional, this.findAll);
        router.get('/:comment', auth.optional, this.findOne);
        router.post('/', auth.required, this.comment);
        router.delete('/:comment', auth.required, this.uncomment);
        return router;
    }
}

module.exports = new CommentCtrl();
