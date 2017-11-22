/*
  Fichier     : controllers/tasks.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des tâches
*/

const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');

// Définition du controleur
class TaskCtrl extends PublicationCtrl {
    constructor(){
        super('task');
    }

    getQueryFromRequest(){
        var query = super.getQueryFromRequest(req);        
        if(typeof req.query.startAmount !== 'undefined' && typeof req.query.endAmount !== 'undefined') {
            query.amount = { 
                $gte: new Number(req.query.startAmount),
                $lte: new Number(req.query.endAmount)
            }
        }
        if(typeof req.query.startCompletionDate !== 'undefined' && typeof req.query.endCompletionDate !== 'undefined') {
            query.completionDate = { 
                $gte: new ISODate(req.query.startCompletionDate),
                $lte: new ISODate(req.query.endCompletionDate)
            }
        }
        if(typeof req.query.onSite !== 'undefined' ) {
            query.onSite = req.query.onSite
        }
        if(typeof req.query.materialIsSupplied !== 'undefined' ) {
            query.materialIsSupplied = req.query.materialIsSupplied
        }        
        if(typeof req.query.concern !== 'undefined' ) {
            query.concern = { _id : mongoose.Types.ObjectId(req.query.concern) };
        }
        return query;
    }

    confirm(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la task
            return this.Model
            .findOneAndUpdate({_id: task._id }, { $set: { confirmedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('task_confirmed', user, { kind: 'task', item: task })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    pay(req, res, next) {
        // On recherche l'utilisateur authentifié
        return this.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la task
            return this.Model
            .findOneAndUpdate({_id: task._id }, { $set: { paidAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('task_paid', user, { kind: 'task', item: task })
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
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return this.Model
            .findOneAndUpdate({_id: task._id }, { $set: { canceledAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return this.Event
                .newEvent('task_canceled', user, { kind: 'task', item: task }, {})
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    getRoutes() {
        // On récupère le router
        var router = super.getRoutes();

        // POST : http://<url-site-web:port>/api/propositions/accept
        // Accepte la task correspondante
        router.post('/:task/confirm', auth.required, this.confirm);

        // POST : http://<url-site-web:port>/api/propositions/reject
        // Rejette la task correspondante
        router.post('/:task/pay', auth.required, this.pay);

        // POST : http://<url-site-web:port>/api/propositions/cancel
        // Annule la task correspondante
        router.post('/:task/cancel', auth.required, this.cancel);

        // On renvoie le router
        return router;
    }
}

module.exports = new TaskCtrl();