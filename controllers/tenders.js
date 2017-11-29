/*
  Fichier     : controllers/tenders.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des appels d'offres
*/

const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');


// Définition du controleur
class TenderCtrl extends PublicationCtrl {
    constructor(){
        super();
    }

    cancel(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'item préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return this.Model
            .findOneAndUpdate({_id: tender._id }, { $set: { canceledAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('tender_canceled', user, { kind: this.ModelName, item: tender }, {})
                .then(function() {
                    return res.status(200).json({ tender: tender });
                 });
            });
        }).catch(next);
    }

    close(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'item préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return this.Model
            .findOneAndUpdate({_id: tender._id }, { $set: { closedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('tender_closed', user, { kind: this.ModelName, item: tender }, {})
                .then(function() {
                    return res.status(200).json({ tender: tender });
                 });
            });
        }).catch(next);
    }

    getQueryFromRequest(req) {
        var query = super.getQueryFromRequest(req);        
        if(typeof req.query.startWorkDate !== 'undefined' && typeof req.query.endWorkDate !== 'undefined') {
            query.workDate = { 
                $gte: new ISODate(req.query.startWorkDate),
                $lte: new ISODate(req.query.endWorkDate)
            }
        }
        if(typeof req.query.canAcceptPrivateProps !== 'undefined' ) {
            query.canAcceptPrivateProps = req.query.canAcceptPrivateProps
        }
        if(typeof req.query.validOnly !== 'undefined' ) {
            query.validityStart = { $lte: Date.now() };
            query.validityEnd = { $gte: Date.now() };
        }    
        if(typeof req.query.target !== 'undefined' ) {
            query.target = { _id : mongoose.Types.ObjectId(req.query.target) };
        }
        if(typeof req.query.localisation !== 'undefined') {
            query.address.loc = { 
                loc: { 
                    $near : { 
                        $geometry : { 
                            type : "Point" ,
                            coordinates : [ new Number(req.query.localisation.longitude) , new Number(req.localisation.latitude) ] 
                        } ,
                        $maxDistance : new Number(req.query.localisation.distance) || 50
                    } 
                } 
            }
        }
        return query;
    }

    preload(req, res, next) {
        return super.preload(req, res, next,'tender');
    }

    findOne(req, res, next) {
        return super.findOne(req, res, next,'tender');
    }

    findAll(req, res, next) {
        return super.findAll(req, res, next,'tender');
    }

    count(req, res, next) {
        return super.count(req, res, next,'tender');
    }

    create(req, res, next) {
        return super.create(req, res, next,'tender');
    }

    edit(req, res, next) {
        return super.edit(req, res, next,'tender');
    }

    editAddress(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }            
            // On sauve la nouvelle addresse
            var address = req.body.address;
            return Address
            .findOneAndUpdate({ 
                'loc.coordinates': address.loc.coordinates
            }, address, { new: true, upsert:true })
            .then(function(addr){
                // On contrôle l'adresse
                if(!addr) { return res.sendStatus(422); }
                // On ajoute l'adresse à l'appel d'offres
                return mongoose.model(name)
                .findOneAndUpdate({_id: req.tender._id }, { $set: { address:addr }}, { new: true })
                then(function(newTender) {
                    // On crée un evenement
                    return Event
                    .newEvent('tender_updated', user, { kind: 'tender', item: newTender })
                    .then(function() {
                        // On renvoie un statut OK avec l'utilisateur et le token
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    publish(req, res, next) {
        return super.publish(req, res, next,'tender');
    }

    delete(req, res, next) {
        return super.delete(req, res, next,'tender');
    }

    comment(req, res, next) {
        return super.comment(req, res, next,'tender');
    }

    uncomment(req, res, next) {
        return super.uncomment(req, res, next,'tender');
    }

    like(req, res, next) {
        return super.like(req, res, next,'tender');
    }

    unlike(req, res, next) {
        return super.unlike(req, res, next,'tender');
    }

    getRoutes() {
        var router = super.getRoutes('tender');
        router.post('/:tender/close', auth.required, this.close);
        router.post('/:tender/cancel', auth.required, this.cancel);
        return router;
    }
}

module.exports = new TenderCtrl();

