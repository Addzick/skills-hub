/*
  Fichier     : controllers/categories.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des categories
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Récupération des modeles Mongoose
var Category = mongoose.model('Category');

// Définition des fonctions exportables
module.exports = {
    // ******************************//
    // GETALL
    // ******************************//
    getAll: function(req, res, next) {        
        // On renvoie le résultat après execution des requêtes
        Category.find({}).then(function(categories){
            // On contrôle que l'on ait des catégories
            if(!categories) return res.sendStatus(404);
            // On remplit les categories
            return res.status(200).json({ categories: categories });
        }).catch(next);
    },

    // ******************************//
    // GETBYID
    // ******************************//
    getById: function(req, res, next) {
        // On récupère le paramètre depuis la requête
        var id = req.params.category;
        // On recherche la categorie correspondante
        Category.findById(id).then(function(category){
            // Si aucune catégorie trouvée, on renvoie une erreur 404
            if(!category) { return res.sendStatus(404); }        
            // On remplit les categories
            return res.status(200).json({ category: category });
        }).catch(next);
    }
};

