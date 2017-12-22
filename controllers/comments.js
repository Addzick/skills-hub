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
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(), 
            Comment.findOne({_id: mongoose.Types.ObjectId(req.params.comment)}).exec()
        ]).then(function(results) {
            if (!results || results.length < 2) { return res.sendStatus(404); }
            return res.status(200).json({ 
                comment: results[1].toJSONFor(results[0])
            });
        }).catch(next);
    }

    findAll(req, res, next) {
        var query = {};
        var opts = { skip: 0, limit: 20, sort: { updatedAt: 'desc' } };
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }
        if(typeof req.query.source !== 'undefined' ) {
            query['source.item'] = mongoose.Types.ObjectId(req.query.source);
        }        
        if(typeof req.query.sortBy !== 'undefined') {
            opts.sort[req.query.sortBy] = req.query.sortDir || 'asc';
        }
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        } 
               
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            Comment.find(query, {}, opts).exec(),
            Comment.count(query).exec()
        ]).then(function(results){ 
            var user = results[0];
            var comments = results[1];
            var nb = results[2];
            return res.status(200).json({ 
                comments: comments.map(function(comment) {
                    return comment.toJSONFor(user);
                }),
                count: nb
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
                .findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(comment.source.item) }, 
                    { $push: { comments: comment._id }, $inc: { nbComments : 1 }}, 
                    { new: true })
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ comment.source.kind }_commented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return Comment.findOne({_id: mongoose.Types.ObjectId(comment._id) }).then(com => {
                            return res.status(200).json({ comment: com.toJSONFor(user) });
                        });
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
            return Comment
            .findByIdAndRemove(req.comment._id)
            .then(function(comment) {
                // On supprime le lien avec la source
                return mongoose.model(comment.source.kind)
                .findOneAndUpdate(
                    { _id: mongoose.Types.ObjectId(comment.source.item) },
                    { $pull: { comments: req.comment._id }, $inc: { nbComments : -1 }},
                    { new: true })
                .then(function(item) {
                    return Event
                    .findOneAndRemove({ source: { kind: 'comment', item: comment._id}})
                    .then(function() {
                        return res.status(200).json({ source: { kind: comment.source.kind, item: item.toJSONFor(user)}});
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
        router.post('/:comment', auth.required, this.uncomment);
        return router;
    }
}

module.exports = new CommentCtrl();
