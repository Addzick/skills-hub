/*
  Fichier     : routes/api/profiles.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des profils
*/

// Importation des ressources externes
var router = require('express').Router();
var mongoose = require('mongoose');

// Récupération du modèle Mongoose correspondant à un utilisateur
var User = mongoose.model('User');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Préchargement des objets 'User' pour les routes contenant le paramètre ':username'
router.param('username', function(req, res, next, username){
  User.findOne({username: username}).then(function(user){
    if (!user) { return res.sendStatus(404); }

    req.profile = user;

    return next();
  }).catch(next);
});

// GET : http://<url-site-web:port>/api/profiles/:username
// Renvoie le profil correspondant à l'utilisateur préchargé au préalable
router.get('/:username', auth.optional, function(req, res, next){
  if(req.payload){
    User.findById(req.payload.id).then(function(user){
      if(!user){ return res.json({profile: req.profile.toProfileJSONFor(false)}); }

      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  } else {
    return res.json({profile: req.profile.toProfileJSONFor(false)});
  }
});

// POST : http://<url-site-web:port>/api/profiles/:username/follow
// Ajout un nouvel utilisateur dans la liste des utilisateurs suivis par l'utilisateur authentifié
router.post('/:username/follow', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.follow(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

// DELETE : http://<url-site-web:port>/api/profiles/:username/follow
// Supprime un utilisateur dans la liste des utilisateurs suivis par l'utilisateur authentifié
router.delete('/:username/follow', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.unfollow(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

// Exportation du routeur
module.exports = router;
