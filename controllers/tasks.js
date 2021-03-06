/*
  Fichier     : controllers/tasks.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des tâches
*/

const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');
const Event = mongoose.model('event');
const Task = mongoose.model('task');
const User = mongoose.model('user');

// Définition du controleur
class TaskCtrl {
    constructor(){
    }

    preload(req, res, next) {
        return PublicationCtrl.preload(req, res, next,'task');
    }

    findOne(req, res, next) {
        return PublicationCtrl.findOne(req, res, next,'task');
    }

    findAll(req, res, next) {
        var query = PublicationCtrl.getQueryFromRequest(req);        
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
        return PublicationCtrl.findAll(req, res, next,'task', query);
    }

    create(req, res, next) {
        return PublicationCtrl.create(req, res, next,'task');
    }

    edit(req, res, next) {
        return PublicationCtrl.edit(req, res, next,'task');
    }

    delete(req, res, next) {
        return PublicationCtrl.delete(req, res, next,'task');
    }

    confirm(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la task
            return Task
            .findOneAndUpdate({_id: task._id }, { $set: { confirmedAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('task_confirmed', user, { kind: 'task', item: task })
                .then(function() {
                    return res.status(200).json({ task: task });
                 });
            });
        }).catch(next);
    }

    pay(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la task
            return Task
            .findOneAndUpdate({_id: task._id }, { $set: { paidAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('task_paid', user, { kind: 'task', item: task })
                .then(function() {
                    return res.status(200).json({ task: task });
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
            // On récupére la task préchargée
            var task = req.task;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(task.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return Task
            .findOneAndUpdate({_id: task._id }, { $set: { canceledAt: Date.now() }})
            .then(function() {
                // On crée un evenement
                return Event
                .newEvent('task_canceled', user, { kind: 'task', item: task }, {})
                .then(function() {
                    return res.status(200).json({ task: task });
                 });
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('task', this.preload);
        router.get('/', auth.optional, this.findAll);
        router.get('/:task', auth.optional, this.findOne);
        router.post('/', auth.required, this.create);
        router.put('/:task', auth.required, this.edit);
        router.delete('/:task', auth.required, this.delete);
        router.post('/:task/confirm', auth.required, this.confirm);
        router.post('/:task/pay', auth.required, this.pay);
        router.post('/:task/cancel', auth.required, this.cancel);
        return router;
    }
}

module.exports = new TaskCtrl();