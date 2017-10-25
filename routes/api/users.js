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
var User = mongoose.model('User');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// GET : http://<url-site-web:port>/api/login
// Renvoie la page de login
router.get('/login', function(req, res){
  res.render('login', { message: req.flash('loginMessage') });
});
// POST : http://<url-site-web:port>/api/login
// Authentifie un utilisateur
router.post('/login', function(req, res, next){
  passport.authenticate('local-login', {session: false}, function(err, user, info){
    if(err) return next(err); 
    if(!user) return res.status(422).json(info);
    return res.status(200).json(user);
  })(req, res, next);
});

// GET : http://<url-site-web:port>/api/login
// Renvoie la page d'inscription
router.get('/register', function(req, res){
  res.render('register', { message: req.flash('registerMessage') });
});
// POST : http://<url-site-web:port>/api/register
// Enregistre un nouvel utilisateur
router.post('/register', function(req, res, next){
  passport.authenticate('local-register', {session: false}, function(err, user, info){
    if(err) return next(err); 
    if(!user) return res.status(422).json(info);
    return res.status(200).json(user);
  })(req, res, next);
});


// GET : http://<url-site-web:port>/api/account
// Renvoie le compte de l'utilisateur authentifié
router.get('/account', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});
// PUT : http://<url-site-web:port>/api/account
// Met à jour le compte de l'utilisateur authentifié
router.put('/account', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

// Exportation du routeur
module.exports = router;
