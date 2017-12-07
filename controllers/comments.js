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

    getQueryFromRequest(req) {
        
        // On prépare un objet
        var query = {};

        // A-t-on un auteur ?
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }

        // A-t-on une source ?
        if(typeof req.query.source !== 'undefined' ) {
            query.source.item = { _id : mongoose.Types.ObjectId(req.query.source) };
        }

        // On renvoie l'objet
        return query;
    }

    getOptionsFromRequest(req) {
        // On prépare un objet pour les options
        var opts = { skip: 0, limit: 20, sort: { updatedAt: 'desc' } };

        // A-t-on un champ pour le tri ?
        if(typeof req.query.sort !== 'undefined') {
            opts.sort = req.query.sort;
        }      
        // A-t-on une limite ?
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }

        // A-t-on une page ?
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        }

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
        .populate(this.getChildsFromRequest(req))
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ comment : item });
        }).catch(next);
    }

    findAll(req, res, next) {
        var query = this.getQueryFromRequest(req);
        var opts = this.getOptionsFromRequest(req);
        
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
                .findOneAndUpdate({ _id: comment.source.item._id }, { $push: { comments: comment }, $inc: { nbComments : 1 }})
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