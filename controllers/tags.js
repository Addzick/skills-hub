/*
  Fichier     : controllers/tags.js
  Auteur      : Youness FATH
  Date        : 20.12.2017
  Description : Définit le controleur de gestion des tags
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');
const Article = mongoose.model('article');

// Définition du controleur
class TagsCtrl {

    constructor() {
    }

    getAll(req, res, next) {
        return Article.find({})
        .distinct('tags')
        .exec()
        .then(function(tags) {
            // On renvoie la liste des tags
            return res.status(200).json({ tags: tags });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.get('/', this.getAll);
        // router.get('/stats', this.findOne);
        return router;
    }
}

module.exports = new TagsCtrl();