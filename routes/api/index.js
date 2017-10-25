/*
  Fichier     : routes/api/index.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api
*/

// Importation des ressources externes
var router = require('express').Router();

// Récupération des routeurs prédéfinis pour chaque composant de l'api
var users     = require('./users');
var profiles  = require('./profiles');
var articles  = require('./articles');
var tags      = require('./tags');

// Définition des routes d'accès pour chaque composant de l'api
router.use('/', users);
router.use('/profiles', profiles);
router.use('/articles', articles);
router.use('/tags', tags);

// Définition du traitement de transformation des erreurs de validation
router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

// Exportation du routeur
module.exports = router;