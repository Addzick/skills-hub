/*
  Fichier     : routes/api/index.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api
*/

// Importation des ressources externes
import Router from 'express';

// Récupération des routeurs prédéfinis pour chaque composant de l'api
var articles      = require('./articles');
var categories    = require('./categories');
var propositions  = require('./propositions');
var ratings       = require('./ratings');
var tasks         = require('./tasks');
var tenders       = require('./tenders');
var users         = require('./users');

// Définition des routes d'accès pour chaque composant de l'api
router.use('/articles', articles);
router.use('/categories', categories);
router.use('/propositions', propositions);
router.use('/ratings', ratings);
router.use('/tasks', tasks);
router.use('/tenders', tenders);
router.use('/', users);

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