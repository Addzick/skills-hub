/*
  Fichier     : controllers/ratings.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des ratings
*/

import mongoose from 'mongoose';
import PublicationCtrl  from './publications';

// Récupération des modeles mongoose
var Rating = mongoose.model('rating');

// Définition du controleur
export class RatingCtrl extends PublicationCtrl {
    constructor(){
        super(Rating);
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