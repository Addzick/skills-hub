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
var Comment = mongoose.model('Comment');
var Like = mongoose.model('Like');
var User = mongoose.model('User');
var Event = mongoose.model('Event');

// Définition des fonctions exportables
module.exports = {
    
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

    // ******************************//
    // COMMENT
    // ******************************//
    comment:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On crée un commentaire            
            return Comment.create({ body: req.body.comment.body, author: user }).then(function(comment) {
                // On récupére l'article préchargé
                var article = req.article;
                // On ajoute le commentaire à l'article
                article.comments.push(comment);
                article.save().then(function() {
                    // On crée un evenement
                    Event.newEvent(enums.eventType[10], user, { kind: 'comment', item: comment }, { kind: 'article', item: article }).then(function() {
                        // On renvoie un statut OK avec l'utilisateur et le token
                        return res.status(200).json({ article: article });
                    });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // UNCOMMENT
    // ******************************//
    uncomment:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére le commentaire et l'article préchargé
            var comment = req.comment;
            var article = req.article;
            // On supprime le commentaire
            return Comment.findByIdAndRemove(comment._id).then(function(){
                // On supprime le lien avec l'article
                article.comments.remove(comment);
                // On sauve l'article
                article.save().then(function() {
                    // On crée un evenement
                    Event.newEvent(enums.eventType[11], user, { kind: 'comment', item: comment }, { kind: 'article', item: article }).then(function() {
                        // On renvoie un statut OK avec l'utilisateur et le token
                        return res.status(200).json({ article: article });
                    });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // LIKE
    // ******************************//
    like:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On crée un commentaire
            return Like.create({ user: user }).then(function(like) {
                // On récupére l'article préchargé
                var article = req.article;
                // On ajoute le commentaire à l'article
                article.likes.push(like);
                article.save().then(function() {
                    // On crée un evenement
                    Event.newEvent(enums.eventType[12], user, { kind: 'like', item: like }, { kind: 'article', item: article }).then(function() {
                        // On renvoie un statut OK avec l'article
                        return res.status(200).json({ article: article });
                    });
                });
            });
        }).catch(next);
    },

    // ******************************//
    // UNCOMMENT
    // ******************************//
    unlike:  function(req, res, next) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id).then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére le commentaire et l'article préchargé
            var like = req.like;
            var article = req.article;
            // On supprime le commentaire
            return Like.findByIdAndRemove(like._id).then(function(){
                // On supprime le lien avec l'article
                article.likes.remove(like);
                // On sauve l'article
                article.save().then(function() {
                    // On crée un evenement
                    Event.newEvent(enums.eventType[13], user, { kind: 'Like', item: like }, { kind: 'Article', item: article }).then(function() {
                        // On renvoie un statut OK avec l'article
                        return res.status(200).json({ article: article });
                    });
                });
            });
        }).catch(next);
    },

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
            query.title = { '$regex' : '.*' + req.query.title + '.*' };
        }
        
        // A-t-on un categorie ?
        if(typeof req.query.category !== 'undefined') {
            query.categories = { '$in' : [req.query.category] };
        }
      
        // A-t-on un tag ?  
        if(typeof req.query.tag !== 'undefined' ) {
            query.tags = { '$in' : [req.query.tag] };
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
        if(typeof req.query.sort !== 'undefined') {
            opts.sort = req.query.sort;
        }
        // On renvoie le résultat après execution des requêtes
        return Promise.all([
            Article
            .find(query, {}, opts)
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
            if(typeof req.query.sort !== 'undefined') {
                opts.sort = req.query.sort;
            }
           
            // On renvoie le résultat après execution des requêtes
            return Promise.all([
                Article
                .find(query, {}, opts)
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
        .findById(req.params.article)
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
        .findById(req.params.article)
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
        .findById(req.params.article)
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
    // PRELOAD ARTICLE
    // ******************************//
    preloadArticle: function(req, res, next) {
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
    // PRELOAD COMMENT
    // ******************************//
    preloadComment: function(req, res, next) {
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
    preloadLike: function(req, res, next) {
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
};

