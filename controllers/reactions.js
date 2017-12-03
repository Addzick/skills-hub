/*
  Fichier     : controllers/reactions.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion des reactions
*/

// Importation des ressources externes
const auth = require('../config/auth');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Event = mongoose.model('event');
const Comment = mongoose.model('comment');
const Like = mongoose.model('like');

// Définition du controleur de base
module.exports = class ReactionCtrl {   

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

    preloadComment(req, res, next) {
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

    preloadLike(req, res, next) {
        // On recherche le like correspondant
        return Like
        .findOne({_id: mongoose.Types.ObjectId(req.params.like)})
        .then(function(like) {
            // Si aucun like trouvé, on renvoie une erreur 404
            if(!like) { return res.sendStatus(404); }        
            // On remplit la requête avec le like trouvé
            req.like = like;
            // On continue l'execution
            return next();
          }).catch(next);
    }

    findOneComment(req, res, next) {
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

    findOneLike(req, res, next) {
        // On execute la requête de sélection et on renvoie le résultat
        return Like
        .findOne({_id: mongoose.Types.ObjectId(req.params.like)})
        .populate(this.getChildsFromRequest(req))
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ like : item });
        }).catch(next);
    }

    findAllComments(req, res, next) {
        return Promise.all([
            Comment
            .find(this.getQueryFromRequest(req), {}, this.getOptionsFromRequest(req))
            .exec(),
            Comment
            .count(this.getQueryFromRequest(req))
            .exec()
        ]).then(function(results){ 
            return res.status(200).json({ 
                comments: results[0],
                count: results[1]
            });
        }).catch(next);
    }

    findAllLikes(req, res, next) {
        return Promise.all([
            Like
            .find(this.getQueryFromRequest(req), {}, this.getOptionsFromRequest(req))
            .exec(),
            Like
            .count(this.getQueryFromRequest(req))
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

    uncomment(req, res, next, name) {
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

    like(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On crée un like            
            return Like
            .create({ 
                author: user,
                source: req.body.source
             })
             .then(function(like) {                
                // On ajoute le like à la source
                return mongoose.model(like.source.kind)
                .findOneAndUpdate({_id: like.source.item._id }, { $push: { likes: like }, $inc: { nbLikes : 1 } })
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ like.source.kind }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.status(200).json({ like: like });
                    });
                });
            });
        }).catch(next);
    }

    unlike(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On supprime le like
            return Like
            .findByIdAndRemove(req.like._id)
            .then(function(like) {
                // On supprime le lien avec la source
                return mongoose.model(like.source.kind)
                .findOneAndUpdate({ _id: like.source.item._id }, { $pull: { likes: like }, $inc: { nbLikes : -1 }})
                .then(function() {
                    // On crée un evenement
                    Event
                    .newEvent(`${ like.source.kind }_unliked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('comment', this.preloadComment);
        router.param('like', this.preloadLike);        
        router.get('/comments', auth.optional, this.findAllComments);
        router.get('/likes', auth.optional, this.findAllLikes);
        router.get('/:comment', auth.optional, this.findOneComment);
        router.get('/:like', auth.optional, this.findOneLike);
        router.post('/comments', auth.required, this.comment);
        router.delete('/comments/:comment', auth.required, this.uncomment);
        router.post('/likes', auth.required, this.like);
        router.delete('/likes/:like', auth.required, this.unlike);
        return router;
    }
}
