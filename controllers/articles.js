/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des articles
*/

import mongoose from 'mongoose';
import PublicationCtrl  from './publications';

// Récupération des modeles mongoose
var Article = mongoose.model('article');

// Définition du controleur
export class ArticleCtrl extends PublicationCtrl {
    constructor(){
        super(Article);
    }

    getQueryFromRequest(){
        var query = super.getQueryFromRequest(req);
        // A-t-on des tags ?  
        if(typeof req.query.tags !== 'undefined' ) {
            query.tags = { $in : req.query.tags };
        }
        return query;
    }

    getTags(req, res, next) {
        Article
        .find({})
        .distinct('tags')
        .exec().then(function(tags) {
            // On renvoie la liste des tags
            return res.status(200).json(tags);
        }).catch(next);
    }
}