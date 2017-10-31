/*
  Fichier     : config/passport.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Configuration du middleware d'authentification
*/

// Importation des ressources externes 
var passport = require('passport');
var mongoose = require('mongoose');

// Récupération de la strategie à utiliser
var LocalStrategy = require('passport-local').Strategy;

// Récupération du modèle Mongoose pour un utilisateur
var User = mongoose.model('User');

// Définition de la méthode de login
passport.use('local-login', new LocalStrategy( { usernameField: 'user[email]', passwordField: 'user[password]', passReqToCallback: true }, function(req, email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    // Si des erreurs existent, on les renvoie
    if(err) return done(err);
    // On contrôle l'existence de l'utilisateur
    if(!user) return done(null, false, { errors: { "email": "is invalid" }});
    // On contrôle le mot de passe
    if (!user.validPassword(password)) return done(null, false, { errors: { "password": "is invalid" }});
    // On renvoie l'utilisateur trouvé
    return done(null, user);
  });
}));