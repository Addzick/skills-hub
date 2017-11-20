import { BaseCtrl } from './base';

/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des articles
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var enums = require('../config/enum');

// Récupération des modeles Mongoose
var Article = mongoose.model('Article');
var Category = mongoose.model('Category');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

// Récupération 
export class ArticleCtrl extends BaseCtrl {

}

// Définition des fonctions exportables
module.exports = {
       
    // ******************************//
    // GETTAGS
    // ******************************//
    getTags: function(req, res, next) {
        Article
        .find({})
        .distinct('tags')
        .exec().then(function(tags) {
            // On renvoie la liste des tags
            return res.status(200).json(tags);
        }).catch(next);
    },

    // ******************************//
    // CREATE
    // ******************************//
    create: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'article
            var article = new Article(req.body.article);            
            // On définit l'auteur
            article.author = user;
            // On sauve l'article
            return article.save().then(function() {
                 // On crée un evenement
                 Event.newEvent(enums.eventType[6], user, { kind: 'Article', item: article }, {}).then(function() {
                     // On renvoie un statut OK avec l'article
                     return res.status(200).json({ article: article });
                 });
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
            // On récupére l'article préchargé
            var article = req.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On ne modifie que les champs modifiés
            if(typeof req.body.article.title !== 'undefined') {  article.title = req.body.article.title; }
            if(typeof req.body.article.description !== 'undefined') { article.description = req.body.article.description; }
            if(typeof req.body.article.body !== 'undefined') { article.body = req.body.article.body; }
            if(typeof req.body.article.tags !== 'undefined') { article.body = req.body.article.body; }
            if(typeof req.body.article.medias !== 'undefined') { article.medias = req.body.article.medias; }
            if(typeof req.body.article.categories !== 'undefined') { article.categories = req.body.article.categories; }            
            // On sauve l'article
            return article.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[7], user, { kind: 'article', item: article }, {}).then(function() {
                    // On renvoie un statut OK avec l'article
                    return res.status(200).json({ article: article });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // PUBLISH
    // ******************************//
    publish: function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'article préchargé
            var article = req.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour la date de publication
            article.publishedAt = Date.now();
            // On sauve l'article
            return article.save().then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[8], user, { kind: 'article', item: article }, {}).then(function() {
                    // On renvoie un statut OK avec l'article
                    return res.status(200).json({ article: article });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // DELETE
    // ******************************//
    delete:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'article préchargé
            var article = req.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On sauve l'article
            return Article.findByIdAndRemove(article._id).then(function() {
                // On crée un evenement
                Event.newEvent(enums.eventType[9], user, { kind: 'article', item: article }, {}).then(function() {
                    // On renvoie un statut OK avec l'article
                    return res.status(200).json({ article: article });
                });
            });
        }).catch(next);
    },
};

