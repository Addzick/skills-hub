/*
  Fichier     : controllers/preloader.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de prechargement des paramètres de requêtes
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Récupération des modeles Mongoose
var Article = mongoose.model('Article');
var Category = mongoose.model('Category');
var Comment = mongoose.model('Comment');
var Like = mongoose.model('Like');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

// Définition des fonctions exportables
module.exports = {
    // ******************************//
    // PRELOAD CATEGORY
    // ******************************//
    getCategory: function(req, res, next) {
        // On récupère le paramètre depuis la requête
        var id = mongoose.Types.ObjectId(req.params.category);
        // On recherche la categorie correspondante
        Category.findById(id).then(function(category){
            // Si aucune catégorie trouvée, on renvoie une erreur 404
            if(!category) { return res.sendStatus(404); }        
            // On remplit la requête avec la catégorie trouvée
            req.category = category;
            // On continue l'execution
            return next();
          }).catch(next);
    },

    // ******************************//
    // PRELOAD ARTICLE
    // ******************************//
    getArticle: function(req, res, next) {
        // On récupère le paramètre depuis la requête        
        var id = mongoose.Types.ObjectId(req.params.article);
        // On recherche l'article correspondant
        Article.findById(id).populate('author').then(function(article){            
            // Si aucun article trouvé, on renvoie une erreur 404
            if(!article) { console.log('Article not found'); return res.sendStatus(404); }        
            // On remplit la requête avec l'article trouvé
            req.article = article;
            // On continue l'execution
            return next();
          }).catch(next);
    },
    
    // ******************************//
    // PRELOAD TENDER
    // ******************************//
    getTender: function(req, res, next) {
        // On récupère le paramètre depuis la requête        
        var id = mongoose.Types.ObjectId(req.params.tender);
        // On recherche l'appel d'offres correspondant
        Tender.findById(id).populate('applicant').then(function(tender){            
            // Si aucun tender trouvé, on renvoie une erreur 404
            if(!tender) { console.log('Tender not found'); return res.sendStatus(404); }        
            // On remplit la requête avec l'appel d'offres trouvé
            req.tender = tender;
            // On continue l'execution
            return next();
          }).catch(next);
    },

    // ******************************//
    // PRELOAD EVENT
    // ******************************//
    getEvent: function(req, res, next) {
        // On récupère le paramètre depuis la requête        
        var id = mongoose.Types.ObjectId(req.params.tender);
        // On recherche l'event correspondant
        Event.findById(id)
        .populate('user')
        .populate('source.item')
        .populate('root.item')        
        .then(function(event){            
            // Si aucun tender trouvé, on renvoie une erreur 404
            if(!event) { console.log('Event not found'); return res.sendStatus(404); }        
            // On remplit la requête avec l'event trouvé
            req.event = event;
            // On continue l'execution
            return next();
          }).catch(next);
    },

    // ******************************//
    // PRELOAD COMMENT
    // ******************************//
    getComment: function(req, res, next) {
        // On récupère le paramètre depuis la requête
        var id = req.params.comment;
        // On recherche le commentaire correspondant
        Comment.findById(id).populate('author').then(function(comment){
            // Si aucun commentaire trouvé, on renvoie une erreur 404
            if(!comment) { return res.sendStatus(404); }        
            // On remplit la requête avec le commentaire trouvé
            req.comment = comment;
            // On continue l'execution
            return next();
          }).catch(next);
    },

    // ******************************//
    // PRELOAD LIKE
    // ******************************//
    getLike: function(req, res, next) {
        // On récupère le paramètre depuis la requête
        var id = req.params.like;
        // On recherche le like correspondant
        Like.findById(id).populate('user').then(function(like){
            // Si aucun like trouvé, on renvoie une erreur 404
            if(!like) { return res.sendStatus(404); }        
            // On remplit la requête avec le like trouvé
            req.like = like;
            // On continue l'execution
            return next();
          }).catch(next);
    }

}
