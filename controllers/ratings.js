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
        super('rating');
    }

    getQueryFromRequest(){
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
}

module.exports = new RatingCtrl();