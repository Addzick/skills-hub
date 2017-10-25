/*
  Fichier     : routes/api/tags.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des tags
*/

// Importation des ressources externes
var router = require('express').Router();
var mongoose = require('mongoose');

// Récupération du modèle Mongoose correspondant à un article
var Article = mongoose.model('Article');

// GET : http://<url-site-web:port>/api/tags/
// Renvoie la liste complète des tags de tous les articles postés
router.get('/', function(req, res, next) {
  Article.find().distinct('tagList').then(function(tags){
    return res.json({tags: tags});
  }).catch(next);
});

// Exportation du routeur
module.exports = router;
