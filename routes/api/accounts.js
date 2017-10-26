/*
  Fichier     : routes/api/users.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des utilisateurs
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');

// Récupération du modèle Mongoose correspondant à un utilisateur
var User      = mongoose.model('User');
var Category  = mongoose.model('Category');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Préchargement d'une categorie si celle-ci est en paramètre
router.param('category', function(req, res, next, id) {
  Category.findById(id).then(function(category){
    if(!comment) { return res.sendStatus(404); }

    req.category = category;

    return next();
  }).catch(next);
});

// POST : http://<url-site-web:port>/api/login
// Authentifie un utilisateur
router.post('/login', function(req, res, next) {
  // On tente d'authentifier l'utilisateur
  passport.authenticate('local-login', { session: false }, function(err, user, info) {
    // Si une erreur a été rencontrée, on la renvoie
    if(err) return next(err); 
    // Si aucun utilisateur n'existe, on renvoie une erreur
    if(!user) return res.status(422).json(info);
    // On renvoie un statut OK avec l'utilisateur et le token
    return res.status(200).json({ 
      token: user.generateJWT(),
      user: user
    });
  })(req, res, next);
});

// POST : http://<url-site-web:port>/api/register
// Enregistre un nouvel utilisateur
router.post('/register', function(req, res, next) {
  // On tente d'enregister l'utilisateur
  passport.authenticate('local-register', {session: false}, function(err, user, info) {
    // Si une erreur a été rencontrée, on la renvoie
    if(err) return next(err); 
    // Si aucun utilisateur n'existe, on renvoie une erreur
    if(!user) return res.status(422).json(info);
    // On renvoie un statut OK avec l'utilisateur et le token
    return res.status(200).json({ 
      token: user.generateJWT(),
      user: user
    });
  })(req, res, next);
});

// GET : http://<url-site-web:port>/api/account
// Renvoie le compte de l'utilisateur authentifié
router.get('/account', auth.required, function(req, res, next){
  // On recherche l'utilisateur authentifié
  User.findById(req.payload.id).then(function(user) {
    // Aucun utilisateur, on renvoie un statut 401
    if(!user){ return res.sendStatus(401); }

    // On remplit les categories favories et les notes recues
    user
    .populate({
      path: 'favorites',
      options: {
        sort: {
          title: 'asc'
        }
      }
    })
    .populate({
      path: 'notes',
      populate:['rater','concern'],
      options: {
        sort: {
          value: 'desc'
        }
      }
    }).execPopulate().then(function(user) {
      // On renvoie un statut OK et l'utilisateur correctement rempli
      return res.status(200).json(user);
    });
  }).catch(next);
});

// POST : http://<url-site-web:port>/api/account/favorite/:category
// Ajoute une nouvelle categorie favorie
router.post('/favorite/:category', auth.required, function(req, res, next){
  // On recherche l'utilisateur authentifié
  User.findById(req.payload.id).then(function(user){
    // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
    if(!user){ return res.sendStatus(401); }
    // On récupére l'identifiant de la categorie
    var id = req.category._id;
    // On l'ajoute aux favoris de l'utilisateur
    if(user.favorites.indexOf(id) === -1) { this.favorites.push(id); }
    // On sauve
    return user.save().then(function(){
      return res.status(200).json(user);
    });
  }).catch(next);
});

// DELETE : http://<url-site-web:port>/api/account/favorite/:category
// Supprime une categorie favorie
router.delete('/favorite/:category', auth.required, function(req, res, next){
  // On recherche l'utilisateur authentifié
  User.findById(req.payload.id).then(function(user){
    // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
    if(!user){ return res.sendStatus(401); }
    // On récupére l'identifiant de la categorie
    var id = req.category._id;
    // On l'ajoute aux favoris de l'utilisateur
    user.favorites.remove(id);
    // On sauve
    return user.save().then(function(){
      return res.status(200).json(user);
    });
  }).catch(next);
});

// Exportation du routeur
module.exports = router;
