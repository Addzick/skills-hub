/*
  Fichier     : controllers/ratings.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des ratings
*/
const mongoose = require('mongoose');
const auth = require('../config/auth');
const PublicationCtrl = require('./publications');

// Définition du controleur
class RatingCtrl {
    constructor(){
    }

    getQueryFromRequest(req) {
        var query = PublicationCtrl.getQueryFromRequest(req);
        // A-t-on une cible ?
        if(typeof req.query.target !== 'undefined' ) {
            query.target = { _id : mongoose.Types.ObjectId(req.query.target) };
        }
        // A-t-on un concern ?
        if(typeof req.query.concern !== 'undefined' ) {
            query.concern = { _id : mongoose.Types.ObjectId(req.query.concern) };
        }
        return query;
    }

    preload(req, res, next) {
        return PublicationCtrl.preload(req, res, next,'rating');
    }

    findOne(req, res, next) {
        return PublicationCtrl.findOne(req, res, next,'rating');
    }

    findAll(req, res, next) {
        return PublicationCtrl.findAll(req, res, next,'rating');
    }

    create(req, res, next) {
        return PublicationCtrl.create(req, res, next,'rating');
    }

    edit(req, res, next) {
        return PublicationCtrl.edit(req, res, next,'rating');
    }

    publish(req, res, next) {
        return PublicationCtrl.publish(req, res, next,'rating');
    }

    delete(req, res, next) {
        return PublicationCtrl.delete(req, res, next,'rating');
    }

    getRoutes() {
        var router = require('express').Router();
        router.param(`rating`, this.preload);
        router.get('/', auth.optional, this.findAll);
        router.get('/:rating', auth.optional, this.findOne);
        router.post('/', auth.required, this.create);
        router.put('/:rating', auth.required, this.edit);
        router.patch('/:rating', auth.required, this.publish);
        router.delete('/:rating', auth.required, this.delete);
        return router;
    }
}

module.exports = new RatingCtrl();