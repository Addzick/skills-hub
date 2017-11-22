/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des articles
*/
var PublicationCtrl = require('./publications.js');
var auth = require('../config/auth');

// Définition du controleur
class ArticleCtrl extends PublicationCtrl {
    constructor(){
        super('article');
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
        this.Model.find({})
        .distinct('tags')
        .exec().then(function(tags) {
            // On renvoie la liste des tags
            return res.status(200).json(tags);
        }).catch(next);
    }

    getRoutes() {
        // On récupère le router
        var router = super.getRoutes();

        // GET : http://<url-site-web:port>/api/articles/tags/
        // Renvoie la liste complète des tags de tous les articles postés
        router.get('/tags', auth.optional, this.getTags);

        // On renvoie le router
        return router;
    }
}

module.exports = new ArticleCtrl();