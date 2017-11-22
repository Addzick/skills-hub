/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des articles
*/
var PublicationCtrl = require('./publications');
var auth = require('../config/auth');

// Définition du controleur
class ArticleCtrl extends PublicationCtrl {
    constructor(){
        super();
    }

    getTags(req, res, next) {
        this.Model.find({})
        .distinct('tags')
        .exec().then(function(tags) {
            // On renvoie la liste des tags
            return res.status(200).json(tags);
        }).catch(next);
    }

    getQueryFromRequest(req){
        var query = super.getQueryFromRequest(req);
        // A-t-on des tags ?  
        if(typeof req.query.tags !== 'undefined' ) {
            query.tags = { $in : req.query.tags };
        }
        return query;
    }
    
    preload(req, res, next) {
        return super.preload(req, res, next,'article');
    }

    findOne(req, res, next) {
        return super.findOne(req, res, next,'article');
    }

    findAll(req, res, next) {
        return super.findAll(req, res, next,'article');
    }

    count(req, res, next) {
        return super.count(req, res, next,'article');
    }

    create(req, res, next) {
        return super.create(req, res, next,'article');
    }

    edit(req, res, next) {
        return super.edit(req, res, next,'article');
    }

    publish(req, res, next) {
        return super.publish(req, res, next,'article');
    }

    delete(req, res, next) {
        return super.delete(req, res, next,'article');
    }

    comment(req, res, next) {
        return super.comment(req, res, next,'article');
    }

    uncomment(req, res, next) {
        return super.uncomment(req, res, next,'article');
    }

    like(req, res, next) {
        return super.like(req, res, next,'article');
    }

    unlike(req, res, next) {
        return super.unlike(req, res, next,'article');
    }

    getRoutes() {
        var router = super.getRoutes('article');
        router.get('/tags', auth.optional, this.getTags);
        return router;
    }
}

module.exports = new ArticleCtrl();