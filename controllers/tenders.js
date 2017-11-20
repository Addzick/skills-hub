/*
  Fichier     : controllers/tenders.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des tenders
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var enums = require('../config/enum');

// Récupération des modeles Mongoose
var Tender = mongoose.model('Tender');
var Category = mongoose.model('Category');
var Comment = mongoose.model('Comment');
var Like = mongoose.model('Like');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

// Définition des fonctions exportables
module.exports = {
    
    // ******************************//
    // CREATE
    // ******************************//
    create: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'appel d'offres
            var tender = new Tender(req.body.tender);
            // On définit l'auteur
            tender.applicant = user;
            // On sauve l'appel d'offres
            return tender.save().then(function() {
                 // On crée un evenement
                 Event.newEvent(enums.eventType[14], user, { kind: 'Tender', item: tender }, {}).then(function() {
                     // On renvoie un statut OK avec l'appel d'offres
                     return res.status(200).json({ tender: tender });
                 });
            });
        }).catch(next);
    },

    // ******************************//
    // EDIT
    // ******************************//
    edit: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'appel d'offres préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.applicant._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On ne modifie que les champs modifiés
            if(typeof req.body.tender.title !== 'undefined') {  tender.title = req.body.tender.title; }
            if(typeof req.body.tender.description !== 'undefined') { tender.description = req.body.tender.description; }
            if(typeof req.body.tender.isPrivate !== 'undefined') { tender.isPrivate = req.body.tender.isPrivate; }
            if(typeof req.body.tender.canAcceptPrivateProps !== 'undefined') { tender.canAcceptPrivateProps = req.body.tender.canAcceptPrivateProps; }
            if(typeof req.body.tender.workDate !== 'undefined') { tender.workDate = req.body.tender.workDate; }
            if(typeof req.body.tender.validityStart !== 'undefined') { tender.validityStart = req.body.tender.validityStart; }
            if(typeof req.body.tender.validityEnd !== 'undefined') { tender.validityEnd = req.body.tender.validityEnd; }
            if(typeof req.body.tender.address !== 'undefined') { tender.address = req.body.tender.address; }
            if(typeof req.body.tender.tags !== 'undefined') { tender.tags = req.body.tender.tags; }
            if(typeof req.body.tender.medias !== 'undefined') { tender.medias = req.body.tender.medias; }
            if(typeof req.body.tender.category !== 'undefined') { tender.category = req.body.tender.category; }            
            // On sauve l'appel d'offres
            return tender.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[15], user, { kind: 'tender', item: tender }, {}).then(function() {
                    // On renvoie un statut OK avec l'appel d'offres
                    return res.status(200).json({ tender: tender });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // PUBLISH
    // ******************************//
    publish: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'appel d'offres préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.applicant._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la date de publication
            tender.publishedAt = Date.now();
            // On sauve l'appel d'offres
            return tender.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[16], user, { kind: 'tender', item: tender }, {}).then(function() {
                    // On renvoie un statut OK avec l'appel d'offres
                    return res.status(200).json({ tender: tender });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // CANCEL
    // ******************************//
    cancel: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'appel d'offres préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.applicant._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la date de publication
            tender.canceledAt = Date.now();
            // On sauve l'appel d'offres
            return tender.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[17], user, { kind: 'tender', item: tender }, {}).then(function() {
                    // On renvoie un statut OK avec l'appel d'offres
                    return res.status(200).json({ tender: tender });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // CANCEL
    // ******************************//
    close: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'appel d'offres préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.applicant._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la date de publication
            tender.closedAt = Date.now();
            // On sauve l'appel d'offres
            return tender.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[18], user, { kind: 'tender', item: tender }, {}).then(function() {
                    // On renvoie un statut OK avec l'appel d'offres
                    return res.status(200).json({ tender: tender });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // DELETE
    // ******************************//
    delete:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'appel d'offres préchargé
            var tender = req.tender;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(tender.applicant._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On sauve l'appel d'offres
            return Tender.findByIdAndRemove(tender._id).then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[19], user, { kind: 'tender', item: tender }, {}).then(function() {
                    // On renvoie un statut OK avec l'appel d'offres
                    return res.status(200).json({ tender: tender });
                });
            });
        }).catch(next);
    },
};

