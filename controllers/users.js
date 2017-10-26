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
    register: function(req, res) {
        // On tente d'enregister l'utilisateur
        passport.authenticate('local-register', {session: false}, function(err, user, info) {
            // Si une erreur a été rencontrée, on la renvoie
            if(err) { return res.status(500).json(err); }
            // Si aucun utilisateur n'existe, on renvoie une erreur
            if(!user) { return res.status(500).json(info); }
            // On crée un evenement
            Event.create({
                type: 0,
                priority: 0,
                user: user._id
            },
            function(err, event) {
                // Si l'evenement n'est pass crée, alors on sort en erreur
                if(err) { return res.status(500).json(err); }
                // On controle l'evenement
                if(!event){  return res.status(500).json({ message: "An error occured when creating a registering event."}); }
            });
            // On renvoie un statut OK avec l'utilisateur et le token
            return res.status(200).json({ 
                token: user.generateJWT(),
                user: user
            });
        });
    },
    
    // ******************************//
    // LOGIN
    // ******************************//
    login: function(req, res) {
        // On tente d'authentifier l'utilisateur
        passport.authenticate('local-login', { session: false }, function(err, user, info) {
           // Si une erreur a été rencontrée, on la renvoie
           if(err) { return res.status(500).json(err); }
           // Si aucun utilisateur n'existe, on renvoie une erreur
           if(!user) { return res.status(500).json(info); }
           // On crée un evenement
           Event.create({
               type: 1,
               priority: 0,
               user: user._id
           },
           function(err, event) {
               // Si l'evenement n'est pass crée, alors on sort en erreur
               if(err) { return res.status(500).json(err); }
               // On controle l'evenement
               if(!event){  return res.status(500).json({ message: "An error occured when creating a login event."}); }
           });
           // On renvoie un statut OK avec l'utilisateur et le token
           return res.status(200).json({ 
               token: user.generateJWT(),
               user: user
           });
       });
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
        .exec(function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Aucun utilisateur, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On renvoie un statut OK et l'utilisateur correctement rempli
            return res.status(200).json(user);
        });;
    },

    // ******************************//
    // FAVORITE
    // ******************************//
    favorite:  function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On l'ajoute aux favoris de l'utilisateur
            var id = req.params.id;
            if(user.favorites.indexOf(id) === -1) { this.favorites.push(id); }
            // On sauve
            return user.save(function(err, user){
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On renvoie l'utilisateur
                return res.status(200).json(user);
            });
        });
    },

    // ******************************//
    // UNFAVORITE
    // ******************************//
    unfavorite: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On l'ajoute aux favoris de l'utilisateur
            var id = req.params.id;
            user.favorites.remove(id);
            // On sauve
            return user.save(function(err, user) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On renvoie l'utilisateur
                return res.status(200).json(user);
            });
        });
    }
};
