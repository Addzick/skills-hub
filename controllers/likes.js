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
const Like = mongoose.model('like');

// Définition du controleur de base
class LikeCtrl {   

    constructor() {}

   preload(req, res, next) {
       return Like
       .findOne({_id: mongoose.Types.ObjectId(req.params.like)})
       .then(function(like) {
           if(!like) { return res.sendStatus(404); }
           req.like = like;
           return next();
        })
        .catch(next);
    }

    findOne(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(), 
            Like.findOne({_id: mongoose.Types.ObjectId(req.params.like)}).exec()
        ]).then(function(results) {
            if (!results || results.length < 2) { return res.sendStatus(404); }
            return res.status(200).json({ 
                like: results[1].toJSONFor(results[0])
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
            Like.find(query, {}, opts).exec(),
            Like.count(query).exec()
        ]).then(function(results){ 
            var user = results[0];
            var likes = results[1];
            var nb = results[2];
            return res.status(200).json({ 
                likes: likes.map(function(like) {
                    return like.toJSONFor(user);
                }),
                count: nb
            });
        }).catch(next);
    }

    like(req, res, next) {
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
                .findOneAndUpdate({_id: mongoose.Types.ObjectId(like.source.item) }, { $push: { likes: like._id }, $inc: { nbLikes : 1 } }, { new: true })
                .then(function(item) {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ like.source.kind }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return Like.findById(like._id).then(li => {
                            return res.status(200).json({ like: li.toJSONFor(user) });
                        });
                    });
                });
            });
        }).catch(next);
    }

    unlike(req, res, next) {
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
                .findOneAndUpdate({ _id: mongoose.Types.ObjectId(like.source.item) }, { 
                    $pull: { likes: like._id }, 
                    $inc: { nbLikes : -1 }
                },{ 
                    new: true
                })
                .then(function(item) {
                    return Event
                    .findOneAndRemove({ source: { kind: 'like', item: like._id}})
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('like', this.preload);        
        router.get('/', auth.optional, this.findAll);
        router.get('/:like', auth.optional, this.findOne);
        router.post('/', auth.required, this.like);
        router.delete('/:like', auth.required, this.unlike);
        return router;
    }
}

module.exports = new LikeCtrl();
