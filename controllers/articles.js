/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur dédié à la gestion des articles
*/
const auth = require('../config/auth');
const mongoose = require('mongoose');
const Article = mongoose.model('article');
const PublicationCtrl = require('./publications');

// Définition du controleur
class ArticleCtrl {
    constructor(){
    }

    preload(req, res, next) {
        return PublicationCtrl.preload(req, res, next,'article');
    }

    findOne(req, res, next) {
        return PublicationCtrl.findOne(req, res, next,'article');
    }

    findAll(req, res, next) {
        var query = PublicationCtrl.getQueryFromRequest(req);
        if(typeof req.query.tags !== 'undefined' ) {
            query.tags = { $in : req.query.tags };
        }
        return PublicationCtrl.findAll(req, res, next,'article', query);
    }

    create(req, res, next) {
        return PublicationCtrl.create(req, res, next,'article');
    }

    edit(req, res, next) {
        return PublicationCtrl.edit(req, res, next,'article');
    }

    delete(req, res, next) {
        return PublicationCtrl.delete(req, res, next,'article');
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('article', this.preload);
        router.get('/', auth.optional, this.findAll);
        router.get('/:article', auth.optional, this.findOne);
        router.post('/', auth.required, this.create);
        router.put('/:article', auth.required, this.edit);
        router.delete('/:article', auth.required, this.delete);
        return router;
    }
}

module.exports = new ArticleCtrl();