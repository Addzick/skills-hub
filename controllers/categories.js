/*
  Fichier     : controllers/categories.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des categories
*/

// Importation des ressources externes
import mongoose from 'mongoose';

// Récupération de modeles mongoose
var Category = mongoose.model('category');

// Définition du controleur
export class CategoryCtrl {

    constructor() {}

    findAll(req, res, next) {        
        // On renvoie le résultat après execution des requêtes
        Category.find({}).then(function(categories){
            if(!categories) return res.sendStatus(404);
            return res.status(200).json({ categories: categories });
        }).catch(next);
    }

    findOne(req, res, next) {
        // On recherche la categorie correspondante
        Category
        .findOne({ _id: mongoose.Types.ObjectId(req.params.category)})
        .then(function(category){
            if(!category) { return res.sendStatus(404); }
            return res.status(200).json({ category: category });
        }).catch(next);
    }
}

