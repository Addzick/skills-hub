/*
  Fichier     : routes/api/tags.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes de base pour l'accès à l'api
*/

// Importation des ressources externes
const router = require('express').Router();

// Récupération des routeurs prédéfinis pour chaque composant de l'api
const articles      = require('./controllers/articles');
const categories    = require('./controllers/categories');
const propositions  = require('./controllers/propositions');
const ratings       = require('./controllers/ratings');
const tasks         = require('./controllers/tasks');
const tenders       = require('./controllers/tenders');
const users         = require('./controllers/users');

// Définition de l'URL pour l'api
router.use('/api', users.getRoutes());
router.use('/api/articles', articles.getRoutes());
router.use('/api/categories', categories.getRoutes());
router.use('/api/propositions', propositions.getRoutes());
router.use('/api/ratings', ratings.getRoutes());
router.use('/api/tasks', tasks.getRoutes());
router.use('/api/tenders', tenders.getRoutes());

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
