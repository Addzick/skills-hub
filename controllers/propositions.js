/*
  Fichier     : controllers/propositions.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des propositions
*/

const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');

// Définition du controleur
class PropositionCtrl extends PublicationCtrl {
    constructor(){
        super();
    }

    accept(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de l'appel d'offres
            if(prop.source.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la proposition
            return this.Model
            .findOneAndUpdate({_id: prop._id }, { $set: { acceptedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('proposition_accepted', user, { kind: 'proposition', item: prop })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    reject(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de l'appel d'offres
            if(prop.source.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la proposition
            return this.Model
            .findOneAndUpdate({_id: prop._id }, { $set: { rejectedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('proposition_rejected', user, { kind: 'proposition', item: prop })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    cancel(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la proposition préchargée
            var prop = req.proposition;
            // On contrôle que l'utilisateur soit bien l'auteur de la proposition
            if(prop.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return this.Model
            .findOneAndUpdate({_id: prop._id }, { $set: { canceledAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('proposition_canceled', user, { kind: 'proposition', item: prop }, {})
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    getQueryFromRequest(req) {
        var query = super.getQueryFromRequest(req);        
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
        return query;
    }

    preload(req, res, next) {
        return super.preload(req, res, next,'proposition');
    }

    findOne(req, res, next) {
        return super.findOne(req, res, next,'proposition');
    }

    findAll(req, res, next) {
        return super.findAll(req, res, next,'proposition');
    }

    count(req, res, next) {
        return super.count(req, res, next,'proposition');
    }

    create(req, res, next) {
        return super.create(req, res, next,'proposition');
    }

    edit(req, res, next) {
        return super.edit(req, res, next,'proposition');
    }

    publish(req, res, next) {
        return super.publish(req, res, next,'proposition');
    }

    delete(req, res, next) {
        return super.delete(req, res, next,'proposition');
    }

    comment(req, res, next) {
        return super.comment(req, res, next,'proposition');
    }

    uncomment(req, res, next) {
        return super.uncomment(req, res, next,'proposition');
    }

    like(req, res, next) {
        return super.like(req, res, next,'proposition');
    }

    unlike(req, res, next) {
        return super.unlike(req, res, next,'proposition');
    }

    getRoutes() {
        var router = super.getRoutes('proposition');
        router.post('/:proposition/accept', auth.required, this.accept);
        router.post('/:proposition/reject', auth.required, this.reject);
        router.post('/:proposition/cancel', auth.required, this.cancel);
        return router;
    }
}

module.exports = new PropositionCtrl();