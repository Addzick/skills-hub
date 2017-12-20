/*
  Fichier     : routes/api/tags.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes de base pour l'accès à l'api
*/

// Importation des ressources externes
const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('./config/passport');

// Définition du traitement d'initialisation
module.exports.initialization = function(app) {

  // Définition de l'URL pour l'api
  router.use('/api',              require('./controllers/users').getRoutes());
  router.use('/api/articles',     require('./controllers/articles').getRoutes());
  router.use('/api/tags',         require('./controllers/tags').getRoutes());
  router.use('/api/categories',   require('./controllers/categories').getRoutes());
  router.use('/api/events',       require('./controllers/events').getRoutes());
  router.use('/api/propositions', require('./controllers/propositions').getRoutes());
  router.use('/api/ratings',      require('./controllers/ratings').getRoutes());
  router.use('/api/tasks',        require('./controllers/tasks').getRoutes());
  router.use('/api/tenders',      require('./controllers/tenders').getRoutes());
  router.use('/api/comments',     require('./controllers/comments').getRoutes());
  router.use('/api/likes',        require('./controllers/likes').getRoutes());

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
  
  // Définition du routeur utilisé par l'application
  app.use(router);
};
