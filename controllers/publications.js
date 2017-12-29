/*
  Fichier     : controllers/publications.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion des publications
*/

// Importation des ressources externes
const auth = require('../config/auth');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Category = mongoose.model('category');
const Event = mongoose.model('event');
const Comment = mongoose.model('comment');
const Like = mongoose.model('like');

// Définition du controleur de base
class PublicationCtrl {

    constructor() {}

    preload(req, res, next, name) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            mongoose.model(name).findOne({_id: mongoose.Types.ObjectId(req.params[name])}).exec()
        ])
        .then(function(results) {
            if (!results) { return res.sendStatus(404); }
            req[name] = results[1].toJSONFor(results[0])
            return next();
        })
        .catch(next);

        // On recherche l'appel d'offres correspondant
        return mongoose.model(name)
        .findOne({ _id: mongoose.Types.ObjectId(req.params[name]) })
        .then(function(result) {
            
        }).catch(next);
    }

    findOne(req, res, next, name) {
        var wrapper = {};
        wrapper[name] = req[name];
        return res.status(200).json(wrapper);
    }

    findAll(req, res, next, name, query) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            mongoose.model(name).find(query, {}, this.getOptionsFromRequest(req)).exec(),
            mongoose.model(name).count(query).exec()
        ]).then(function(results) { 
            var user = results[0];
            var pubs = results[1];
            var nb = results[2];
            return res.status(200).json({ 
                items: pubs.map(function(pub) {
                    return pub.toJSONFor(user);
                }),
                count: nb
            });
        }).catch(next);
    }

    create(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'item
            var model = mongoose.model(name)
            var item = new model(req.body[name]);
            // On définit l'auteur
            item.author = user;
            // On définit l'adresse par défaut
            if(name == 'tender' && (!item.address || typeof item.address == 'undefined')){
                item.address = user.address;
            }
            // On crée l'item
            return model.create(item).then(function(newItem) {
                 // On crée un evenement
                 return Event
                 .newEvent(`${ name }_published`, user, { kind: name, item: newItem })
                 .then(function() {
                    return model.findById(item._id).then(itm => {
                        var result = {};
                        result[name] = itm.toJSONFor(user);
                        return res.status(200).json(result);
                    });
                 });
            });
        }).catch(next);
    }

    edit(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[name].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On récupére l'item préchargé
            var item = req[name];
            // On définit l'adresse par défaut
            if(name == 'tender' && (!item.address || typeof item.address == 'undefined')){
                item.address = user.address;
            }
            // On met à jour l'item
            return mongoose.model(name)
            .findOneAndUpdate({_id: item._id }, { $set: req.body[name] }, { new: true })
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ name }_updated`, user, { kind: name, item: newItem })
                .then(function() {
                    var result = {};
                    result[name] = newItem;
                    return res.status(200).json(result);
                 });
            });
        }).catch(next);
    }

    delete(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On recupre l'item
            var item = req[name];
            // On contrôle que l'utilisateur soit bien l'auteur
            if(item.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'item
            return mongoose.model(name)
            .findByIdAndRemove(item._id)
            .then(function() {
                return Event
                .remove({ source: { kind: name, item: item._id}})
                .then(function() {
                    return res.sendStatus(202);
                });
                
            });
        }).catch(next);
    }
    
    getQueryFromRequest(req) {
        
        // On prépare un objet
        var query = {};

        // A-t-on un auteur ?
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }

        // A-t-on un titre ?
        if(typeof req.query.title !== 'undefined' ) {
            query.title = { $regex : '.*' + req.query.title + '.*' };
        }

        // A-t-on un categorie ?
        if(typeof req.query.categories !== 'undefined') {
            query.category = { $in : req.query.categories };
        }

        // A-t-on une période ?
        if(typeof req.query.startDate !== 'undefined' && typeof req.query.endDate !== 'undefined') {
            query.updatedAt = { 
                $gte: new ISODate(req.query.startDate),
                $lte: new ISODate(req.query.endDate)
            }
        }

        // On renvoie l'objet
        return query;
    }

    getOptionsFromRequest(req) {
        // On prépare un objet pour les options
        var opts = { skip: 0, limit: 20, sort: { createdAt: 'desc' } };

        // A-t-on un champ pour le tri ?
        if(typeof req.query.sortBy !== 'undefined') {
            opts.sort[req.query.sortBy] = req.query.sortDir || 'asc';
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
}

module.exports = new PublicationCtrl();
