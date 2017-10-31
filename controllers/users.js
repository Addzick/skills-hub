/*
  Fichier     : controllers/users.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des utilisateurs
*/

// Importation des ressources externes
var mongoose    = require('mongoose');
var passport    = require('passport');
var enums       = require('../config/enum');

// Récupération du modèle Mongoose correspondant à un utilisateur
var User      = mongoose.model('User');
var Category  = mongoose.model('Category');
var Event     = mongoose.model('Event');


// Définition des fonctions exportables
module.exports = {

    // ******************************//
    // REGISTER
    // ******************************//
    register: function(req, res, next) {
        // On contrôle la présence d'un email
        if(!req.body.user.email) {
            return res.status(422).json({ errors: { "email": "is required" }});
        }
        // On contrôle la présence du mot de passe
        if(!req.body.user.password) {
            return res.status(422).json({ errors: { "password": "is required" }});
        }
        // On crée un nouvel utilisateur
        var user = new User(req.body.user);
        // On met à jour le nom d'utilisateur et le mot de passe
        user.username = req.body.user.email;
        user.setPassword(req.body.user.password);
        
        // On sauve le nouvel utilisateur
        user.save().then(function() {
            // On crée un evenement
            Event.newEvent(enums.eventType[0], user, { kind: 'User', item: user }, {}).then(function() {
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
           Event.newEvent(enums.eventType[1], user, { kind: 'User', item: user }, {}).then(function() {
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
            Event.newEvent(enums.eventType[2], user, { kind: 'User', item: user }, {}).then(function() {
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
            if(typeof req.body.user.email !== 'undefined') {
                user.username   = req.body.user.email;
                user.email      = req.body.user.email;
            }
            if(typeof req.body.user.password !== 'undefined') {
                user.setPassword(req.body.user.password);
            }
            if(typeof req.body.user.firstname !== 'undefined') {
                user.firstname = req.body.user.firstname;
            }
            if(typeof req.body.user.lastname !== 'undefined') {
                user.lastname = req.body.user.lastname;
            }
            if(typeof req.body.user.bio !== 'undefined') {
                user.bio = req.body.user.bio;
            }
            if(typeof req.body.user.image !== 'undefined'){
                user.image = req.body.user.image;
            }
            if(typeof req.body.user.address !== 'undefined') {
                user.address = req.body.user.address;
            }
            
            // On sauve le nouvel utilisateur
            user.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[3], user, { kind: 'User', item: user }, {}).then(function() {
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
    // FAVORITE
    // ******************************//
    favorite:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la categorie
            var category = req.category;
            // L'utilisateur a-t-il déja cette catégorie en favori ?
            if(user.favorites.indexOf(category._id) !== -1) { 
                // On renvoie un statut OK mais sans rien changé
                return res.status(202).json({ user: user }); 
            }
            // On ajoute la categorie aux favoris de l'utilisateur
            user.favorites.push(category);            
            // On sauve
            return user.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[4], user, { kind: 'Category', item: category }, { kind: 'User', item: user }).then(function() {
                    // On renvoie un statut OK avec l'utilisateur
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
            // On récupére la categorie
            var category = req.category;
            // L'utilisateur a-t-il déja cette catégorie en favori ?
            if(user.favorites.indexOf(category._id) === -1) { 
                // On renvoie un statut OK mais sans rien changé
                return res.status(202).json({ user: user }); 
            }
            // On supprime la catégorie des favoris de l'utilisateur
            user.favorites.remove(category);
            // On sauve
            return user.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[5], user, { kind: 'Category', item: category }, { kind: 'User', item: user }).then(function() {
                    // On renvoie un statut OK avec l'utilisateur et le token
                    return res.status(200).json({ user: user });
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
    // PRELOAD CATEGORY
    // ******************************//
    preloadCategory: function(req, res, next) {
        // On récupère le paramètre depuis la requête
        var id = req.params.category;
        // On recherche la categorie correspondante
        Category.findById(id).then(function(category){
            // Si aucune catégorie trouvée, on renvoie une erreur 404
            if(!category) { return res.sendStatus(404); }        
            // On remplit la requête avec la catégorie trouvée
            req.category = category;
            // On continue l'execution
            return next();
          }).catch(next);
    }
};
