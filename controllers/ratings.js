/*
  Fichier     : controllers/ratings.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des ratings
*/

const mongoose = require('mongoose');
const PublicationCtrl = require('./publications');

// Définition du controleur
class RatingCtrl extends PublicationCtrl {
    constructor(){
        super();
    }

    getQueryFromRequest(req) {
        var query = super.getQueryFromRequest(req);
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
        return super.preload(req, res, next,'rating');
    }

    findOne(req, res, next) {
        return super.findOne(req, res, next,'rating');
    }

    findAll(req, res, next) {
        return super.findAll(req, res, next,'rating');
    }

    create(req, res, next) {
        return super.create(req, res, next,'rating');
    }

    edit(req, res, next) {
        return super.edit(req, res, next,'rating');
    }

    publish(req, res, next) {
        return super.publish(req, res, next,'rating');
    }

    delete(req, res, next) {
        return super.delete(req, res, next,'rating');
    }

    getRoutes() {
        return super.getRoutes('rating');
    }
}

module.exports = new RatingCtrl();