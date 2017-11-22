/*
  Fichier     : controllers/categories.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des categories
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');
const Category = mongoose.model('category');

// Définition du controleur
class CategoryCtrl {

    constructor() {
    }

    findAll(req, res, next) {
        // On renvoie le résultat après execution des requêtes
        return Category.find({}).then(function(categories){
            if(!categories) return res.sendStatus(404);
            return res.status(200).json({ categories: categories });
        }).catch(next);
    }

    findOne(req, res, next) {
        // On recherche la categorie correspondante
        return Category
        .findOne({ _id: mongoose.Types.ObjectId(req.params.category)})
        .then(function(category){
            if(!category) { return res.sendStatus(404); }
            return res.status(200).json({ category: category });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.get('/', auth.optional, this.findAll);
        router.get('/:category', auth.optional, this.findOne);
        return router;
    }
}

module.exports = new CategoryCtrl();