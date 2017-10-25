/*
  Fichier     : routes/api/tags.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes de base pour l'accès à l'api
*/

// Récupération du routeur Express
var router = require('express').Router();

// Définition de l'URL de base pour l'accès à l'api
router.use('/api', require('./api'));

// Exportation du routeur
module.exports = router;
