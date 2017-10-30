/*
  Fichier     : controllers/users.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des utilisateurs
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var passport = require('passport');

// Récupération du modèle Mongoose correspondant à un utilisateur
var User      = mongoose.model('User');
var Event     = mongoose.model('Event');

// Définition des fonctions exportables
module.exports = {

    // ******************************//
    // REGISTER
    // ******************************//
    register: function(req, res, next) {        
        // On contrôle la présence d'un email
        if(!req.body.email) {
            return res.status(422).json({ errors: { "email": "is required" }});
        }
        // On contrôle la présence du mot de passe
        if(!req.body.password) {
            return res.status(422).json({ errors: { "password": "is required" }});
        }

        // On crée un nouvel utilisateur
        var user = new User(req.body);
        // On met à jour le nom d'utilisateur et le mot de passe
        user.username = req.body.email;
        user.setPassword(req.body.password);
        
        // On sauve le nouvel utilisateur
        user.save().then(function() {
            // On crée un evenement
            var event = new Event();
            event.type = 0;
            event.priority = 0;
            event.user = user;
            event.source = user;
            event.save().then(function() {
                // On renvoie un statut OK avec l'utilisateur et l'evenement correspondant
                return res.status(200).json({ 
                    token: user.generateJWT(),
                    user: user
                });
            });
        }).catch(next);
    },

    // ******************************//
    // LOGIN
    // ******************************//
    login: function(req, res, next) {
        // On contrôle la présence d'un email
        if(!req.body.user.email) {
            return res.status(422).json({ errors: { "email": "is required" }});
        }
        // On contrôle la présence du mot de passe
        if(!req.body.user.password) {
            return res.status(422).json({ errors: { "password": "is required" }});
        }

        // On tente d'authentifier l'utilisateur
        passport.authenticate('local-login', { session: false }, function(err, user, info) {
           // Si une erreur a été rencontrée, on la renvoie
           if(err) { return res.status(500).json(err); }
           // Si aucun utilisateur n'existe, on renvoie une erreur
           if(!user) { return res.status(500).json(info); }
           // On crée un evenement
           var event = new Event();
           event.type = 1;
           event.priority = 0;
           event.user = user;
           event.source = user;
           event.save().then(function() {
               // On renvoie un statut OK avec l'utilisateur et le token
               return res.status(200).json({ 
                   token: user.generateJWT(),
                   user: user,
               });
           }).catch(next);
       })(req, res, next);
    },

    // ******************************//
    // LOGOUT
    // ******************************//
    logout: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Aucun utilisateur, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On crée un evenement
            var event = new Event();
            event.type = 2;
            event.priority = 0;
            event.user = user;
            event.source = user;
            event.save().then(function() {
                // On renvoie un statut OK avec l'utilisateur et le token
                return res.sendStatus(202);
            });
        }).catch(next);
    },

    // ******************************//
    // EDIT
    // ******************************//
    edit: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On modifie uniquement les infos modifiées
            if(typeof req.body.email !== 'undefined') {
                user.username   = req.body.email;
                user.email      = req.body.email;
            }
            if(typeof req.body.password !== 'undefined') {
                user.setPassword(req.body.password);
            }
            if(typeof req.body.firstname !== 'undefined') {
                user.firstname = req.body.firstname;
            }
            if(typeof req.body.lastname !== 'undefined') {
                user.lastname = req.body.lastname;
            }
            if(typeof req.body.bio !== 'undefined') {
                user.bio = req.body.bio;
            }
            if(typeof req.body.image !== 'undefined'){
                user.image = req.body.image;
            }
            if(typeof req.body.address !== 'undefined') {
                user.address = req.body.address;
            }
            
            // On sauve le nouvel utilisateur
            user.save().then(function() {
                // On crée un evenement
                var event = new Event();
                event.type = 3;
                event.priority = 0;
                event.user = user;
                event.source = user;
                event.save().then(function() {
                    // On renvoie un statut OK avec l'utilisateur et le token
                    return res.status(200).json({ 
                        token: user.generateJWT(),
                        user: user
                    });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // GETBYID
    // ******************************//
    getById: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id)
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
        })
        .exec().then(function(user) {
            // Aucun utilisateur, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On renvoie un statut OK et l'utilisateur correctement rempli
            return res.status(200).json(user);
        }).catch(next);
    },    

    // ******************************//
    // FAVORITE
    // ******************************//
    favorite:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On l'ajoute aux favoris de l'utilisateur
            var id = req.params.id;
            if(user.favorites.indexOf(id) === -1) { this.favorites.push(id); }
            // On sauve
            return user.save().then(function() {
                // On crée un evenement
                var event = new Event();
                event.type = 3;
                event.priority = 0;
                event.user = user;
                event.source = user;
                event.save().then(function() {
                    // On renvoie un statut OK avec l'utilisateur et le token
                    return res.status(200).json({ user: user });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // UNFAVORITE
    // ******************************//
    unfavorite: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On l'ajoute aux favoris de l'utilisateur
            var id = req.params.id;
            user.favorites.remove(id);
            // On sauve
            return user.save().then(function() {
                // On crée un evenement
                var event = new Event();
                event.type = 3;
                event.priority = 0;
                event.user = user;
                event.source = user;
                event.save().then(function() {
                    // On renvoie un statut OK avec l'utilisateur et le token
                    return res.status(200).json({ user: user });
                });
            });
        }).catch(next);
    }
};
