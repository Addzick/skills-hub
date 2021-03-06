/*
  Fichier     : controllers/propositions.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des propositions
*/
const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');
const Event = mongoose.model('event');
const Proposition = mongoose.model('proposition');
const User = mongoose.model('user');

// Définition du controleur
class PropositionCtrl {
    constructor(){
    }

    preload(req, res, next) {
        return PublicationCtrl.preload(req, res, next,'proposition');
    }

    findOne(req, res, next) {
        return PublicationCtrl.findOne(req, res, next,'proposition');
    }

    findAll(req, res, next) {
        var query = PublicationCtrl.getQueryFromRequest(req);        
        if(typeof req.query.startAmount !== 'undefined' && typeof req.query.endAmount !== 'undefined') {
            query.amount = { 
                $gte: new Number(req.query.startAmount),
                $lte: new Number(req.query.endAmount)
            };
        }
        if(typeof req.query.validOnly !== 'undefined' ) {
            query.validityStart = { $lte: Date.now() };
            query.validityEnd = { $gte: Date.now() };
        }     
        if(typeof req.query.source !== 'undefined' ) {
            query.source = { _id : mongoose.Types.ObjectId(req.query.source) };
        }
        return PublicationCtrl.findAll(req, res, next,'proposition', query);
    }

    create(req, res, next) {
        return PublicationCtrl.create(req, res, next,'proposition');
    }

    edit(req, res, next) {
        return PublicationCtrl.edit(req, res, next,'proposition');
    }

    delete(req, res, next) {
        return PublicationCtrl.delete(req, res, next,'proposition');
    }

    accept(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de l'appel d'offres
            if(prop.source.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la proposition
            return Proposition
            .findOneAndUpdate({_id: prop._id }, { $set: { acceptedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('proposition_accepted', user, { kind: 'proposition', item: prop })
                .then(function() {
                    return res.status(200).json({ proposition: prop });
                 });
            });
        }).catch(next);
    }

    reject(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de l'appel d'offres
            if(prop.source.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la proposition
            return Proposition
            .findOneAndUpdate({_id: prop._id }, { $set: { rejectedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('proposition_rejected', user, { kind: 'proposition', item: prop })
                .then(function() {
                    return res.status(200).json({ proposition: prop });
                 });
            });
        }).catch(next);
    }

    cancel(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de la proposition
            if(prop.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return Proposition
            .findOneAndUpdate({_id: prop._id }, { $set: { canceledAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('proposition_canceled', user, { kind: 'proposition', item: prop }, {})
                .then(function() {
                    return res.status(200).json({ proposition: prop });
                 });
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('proposition', this.preload);
        router.get('/', auth.optional, this.findAll);
        router.get('/:proposition', auth.optional, this.findOne);
        router.post('/', auth.required, this.create);
        router.put('/:proposition', auth.required, this.edit);
        router.delete('/:proposition', auth.required, this.delete);
        router.post('/:proposition/accept', auth.required, this.accept);
        router.post('/:proposition/reject', auth.required, this.reject);
        router.post('/:proposition/cancel', auth.required, this.cancel);
        return router;
    }
}

module.exports = new PropositionCtrl();