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
        super('tender');
    }

    getQueryFromRequest() {
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
        if(typeof req.query.longitude !== 'undefined' && typeof req.query.longitude !== 'undefined') {
            query.address.loc = { 
                loc: { 
                    $near : { 
                        $geometry : { 
                            type : "Point" ,
                            coordinates : [ new Number(req.query.longitude) , new Number(req.query.latitude) ] 
                        } ,
                        $maxDistance : new Number(req.query.distance) || 50
                    } 
                } 
            }
        }
        return query;
    }

    cancel(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
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
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    close(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
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
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    getRoutes() {
        // On récupère le router
        var router = super.getRoutes();

        // POST : http://<url-site-web:port>/api/tenders/accept
        // Accepte le tender correspondante
        router.post('/:tender/close', auth.required, this.close);

        // POST : http://<url-site-web:port>/api/tenders/cancel
        // Annule le tender correspondante
        router.post('/:tender/cancel', auth.required, this.cancel);

        // On renvoie le router
        return router;
    }
}

module.exports = new TenderCtrl();

