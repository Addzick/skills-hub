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

    findOne(req, res, next) {
        // On execute la requête de sélection et on renvoie le résultat
        return Like
        .findOne({_id: mongoose.Types.ObjectId(req.params.like)})
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ like : item });
        }).catch(next);
    }   

    findAll(req, res, next) {
        var query = this.getQueryFromRequest(req);
        var opts = this.getOptionsFromRequest(req);

        return Promise.all([
            Like
            .find(query, {}, opts)
            .exec(),
            Like
            .count(query)
            .exec()
        ]).then(function(results){ 
            return res.status(200).json({ 
                comments: results[0],
                count: results[1]
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
                .findOneAndUpdate({_id: mongoose.Types.ObjectId(like.source.item) }, { $push: { likes: like._id }, $inc: { nbLikes : 1 } })
                .then(function(item) {
                    // On crée un evenement
                    console.log(item);
                    return Event
                    .newEvent(`${ like.source.kind }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.status(200).json({ like: like });
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
        router.param('like', this.preload);        
        router.get('/', auth.optional, this.findAll);
        router.get('/:like', auth.optional, this.findOne);
        router.post('/', auth.required, this.like);
        router.delete('/:like', auth.required, this.unlike);
        return router;
    }
}

module.exports = new LikeCtrl();
