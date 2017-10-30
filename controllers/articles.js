/*
  Fichier     : controllers/articles.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des articles
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
    // GETALL
    // ******************************//
    getAll: function(req, res, next) {
        var query = {};
        var opts = {
            skip: 0,
            limit: 20,
            sort: { createdAt: 'desc' }
        };
        
        // A-t-on un titre ?
        if(typeof req.query.title !== 'undefined' ) {
            query.title = { "$regex" : '.*' + req.query.title + '.*' };
        }
        
        // A-t-on un categorie ?
        if(typeof req.query.category !== 'undefined') {
            query.categories = {"$in" : [req.query.category] };
        }
      
        // A-t-on un tag ?  
        if(typeof req.query.tag !== 'undefined' ) {
            query.tags = {"$in" : [req.query.tag] };
        }
      
        // A-t-on une limite ?
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(size);
        }
        
        // A-t-on une page ?
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((page - 1) * size);
        }
        
        // A-t-on un champ pour le tri ?
        if(typeof req.query.sort !== undefined) {
            opts.sort = req.query.sort;
        }

        // On renvoie le résultat après execution des requêtes
        return Promise.all([
            Article
            .find(query,options)
            .populate('author')
            .populate('categories')
            .exec(),
            Article.count(query).exec(),            
        ]).then(function(results){
            var articles = results[0];
            var count = results[1];            
            return res.status(200).json({
                articles: articles,
                count: count,
                skip: opts.skip,
                limit: opts.limit,
                sort: opts.sort
            });
        }).catch(next);
    },
    
    // ******************************//
    // GETFEED
    // ******************************//
    getFeed: function(req, res, next) {
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }            
            // On prépare la requête
            var query = {
                categories: { '$in': user.categories }
            };
            var opts = {
                skip: 0,
                limit: 20,
                sort: { createdAt: 'desc' }
            };
          
            // A-t-on un titre ?
            if(typeof req.query.title !== 'undefined' ) {
                query.title = { "$regex" : '.*' + req.query.title + '.*' };
            }          
          
            // A-t-on un categorie ?
            if(typeof req.query.category !== 'undefined') {
                query.categories = {"$in" : [req.query.category] };
            }
        
            // A-t-on un tag ?  
            if(typeof req.query.tag !== 'undefined' ) {
                query.tags = {"$in" : [req.query.tag] };
            }
          
            // A-t-on une taille ?
            if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
                opts.limit = Number(size);
            }
          
            // A-t-on une page ?
            if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
                opts.skip = Number((page - 1) * size);
            }
          
            // A-t-on un champ pour le tri ?
            if(typeof req.query.sort !== undefined) {
                opts.sort = req.query.sort;
            }
           
            // On renvoie le résultat après execution des requêtes
            return Promise.all([
                Article
                .find(query,options)
                .populate('author')
                .populate('categories')
                .exec(),
                Article.count(query).exec(),            
            ]).then(function(results){
                var articles = results[0];
                var count = results[1];            
                return res.status(200).json({
                    articles: articles,
                    count: count,
                    skip: opts.skip,
                    limit: opts.limit,
                    sort: opts.sort
                });
            });
        }).catch(next);
    },

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
    // GETBYID
    // ******************************//
    getById: function(req, res, next) {
        Article
        .findById(req.params.id)
        .populate('author')
        .populate('categories')
        .populate({
            path: 'comments',
            options: {
                limit: 20,
                sort: {
                    createdAt: 'desc'
                }
            }
        }).exec().then(function (article) {
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie un statut OK avec l'article
            return res.status(200).json({ article: article });
        }).catch(next);
    },

    // ******************************//
    // GETCOMMENTS
    // ******************************//
    getComments: function(req, res, next) {
        // On initialise les options
        var opts = {
            skip: 0,
            limit: 20,
            sort: { createdAt: 'desc' }
        };

        // A-t-on une limite ?
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(size);
        }
        
        // A-t-on une page ?
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((page - 1) * size);
        }

        // On recherche l'article avec ses commentaires
        Article
        .findById(req.params.id)
        .populate('author')
        .populate('categories')
        .populate({
            path: 'comments',
            options: opts
        })
        .exec().then(function (article) {
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie un statut OK avec l'article
            return res.status(200).json({ article: article });
        }).catch(next);
    },

    // ******************************//
    // GETLIKES
    // ******************************//
    getLikes: function(req, res, next) {
        
        // A-t-on une limite ?
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(size);
        }
        
        // A-t-on une page ?
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((page - 1) * size);
        }

        // On recherche l'article avec ses likes
        Article
        .findById(req.params.id)
        .populate('author')
        .populate('categories')
        .populate({
            path: 'likes',
            options: { sort: { createdAt: 'desc' }}
        })
        .exec().then(function (article) {
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie un statut OK avec l'article
            return res.status(200).json({ article: article });
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
            var article = new Article(req.body);
            // On définit l'auteur
            article.author = user;
            // On sauve l'article
            return article.save().then(function() {
                 // On crée un evenement
                 var event = new Event();
                 event.type = 4;
                 event.priority = 0;
                 event.user = user;
                 event.source = article;
                 event.save().then(function() {
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

            // On recherche l'article à modifier
            Article.findOne({ slug: req.body.slug }).then(function(article){
            
                // On contrôle si un article existe
                if(!article) {return res.sendStatus(404); }
            
                // On contrôle que l'utilisateur soit bien l'auteur
                if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            
                // On ne modifie que les champs modifiés
                if(typeof req.body.title !== 'undefined') {
                    article.title = req.body.title;
                }
                if(typeof req.body.description !== 'undefined') {
                    article.description = req.body.description;
                }
                if(typeof req.body.body !== 'undefined') {
                    article.body = req.body.body;
                }
                if(typeof req.body.tags !== 'undefined') {
                    article.body = req.body.body;
                }
                if(typeof req.body.medias !== 'undefined') {
                    article.medias = req.body.medias;
                }
                if(typeof req.body.categories !== 'undefined') {
                    article.categories = req.body.categories;
                }

                 // On sauve l'article
                 return article.save().then(function() {
                     // On crée un evenement
                     var event = new Event();
                     event.type = 5;
                     event.priority = 0;
                     event.user = user;
                     event.source = article;
                     event.save().then(function() {
                         // On renvoie un statut OK avec l'article
                         return res.status(200).json({ article: article });
                        });
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

            // On recherche l'article à modifier
            Article.findOne({ slug: req.body.slug }).then(function(article){
            
                // On contrôle si un article existe
                if(!article) {return res.sendStatus(404); }
            
                // On contrôle que l'utilisateur soit bien l'auteur
                if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            
                // On met à jour la date de publication
                article.publishedAt = Date.now;

                 // On sauve l'article
                 return article.save().then(function() {
                     // On crée un evenement
                     var event = new Event();
                     event.type = 6;
                     event.priority = 0;
                     event.user = user;
                     event.source = article;
                     event.save().then(function() {
                         // On renvoie un statut OK avec l'article
                         return res.status(200).json({ article: article });
                        });
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

            // On recherche l'article à modifier
            Article.findOne({ slug: req.body.slug }).then(function(article){
            
                // On contrôle si un article existe
                if(!article) {return res.sendStatus(404); }
            
                // On contrôle que l'utilisateur soit bien l'auteur
                if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            
                // On met à jour la date de publication
                article.publishedAt = Date.now;

                 // On sauve l'article
                 return article.remove().then(function() {
                     // On crée un evenement
                     var event = new Event();
                     event.type = 7;
                     event.priority = 0;
                     event.user = user;
                     event.source = article;
                     event.save().then(function() {
                         // On renvoie un statut OK avec l'article
                         return res.status(200).json({ article: article });
                        });
                    });
                });
        }).catch(next);
    }
};

