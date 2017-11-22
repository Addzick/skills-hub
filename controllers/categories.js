/*
  Fichier     : controllers/categories.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des categories
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');

// Définition du controleur
class CategoryCtrl {

    constructor() {
        // Récupération de modeles mongoose
        CategoryCtrl.Category = mongoose.model('category');
    }

    findAll(req, res, next) {        
        // On renvoie le résultat après execution des requêtes
        return CategoryCtrl.Category.find({}).then(function(categories){
            if(!categories) return res.sendStatus(404);
            return res.status(200).json({ categories: categories });
        }).catch(next);
    }

    findOne(req, res, next) {
        // On recherche la categorie correspondante
        return CategoryCtrl.Category
        .findOne({ _id: mongoose.Types.ObjectId(req.params.category)})
        .then(function(category){
            if(!category) { return res.sendStatus(404); }
            return res.status(200).json({ category: category });
        }).catch(next);
    }

    getRoutes() {
        // On récupère le router
        let router = require('express').Router();
        // GET : http://<url-site-web:port>/api/categories/
        // Renvoie la liste des categories après pagination
        router.get('/', auth.optional, this.findAll);

        // GET : http://<url-site-web:port>/api/categories/:id
        // Renvoie la categorie correspondante
        router.get('/:category', auth.optional, this.findOne);

        // On renvoie le router
        return router;
    }
}

module.exports = new CategoryCtrl();