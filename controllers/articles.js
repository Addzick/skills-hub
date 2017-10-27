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
        })
        .exec(function (err, article) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie l'article
            return res.status(200).json(article);
        });
    },
    // ******************************//
    // GETALL
    // ******************************//
    getAll: function(req, res) {
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
        
        // A-t-on un auteur ?
        if(typeof req.query.author !== 'undefined') {
            User.findOne({ username: req.query.author }).then(function(user) {
                query.author = author._id;
            });
        }
        
        // A-t-on un categorie ?
        if(typeof req.query.category !== 'undefined') {
            Category.findOne({ title: req.query.category }).then(function(category){
                query.categories = {"$in" : [category._id] };
            });
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
        
        // On execute la requete d'abord, puis 
        Article.count(query).exec(function(err, count){
            // On contrôle s'il y a une erreur
            if(err) { return res.status(500).json(err); }
            // On contrôle le résultat du comptage
            if(!count) { return res.status(500).json({ message: "An error occured while counting articles."}); }
            // On récupère les articles paginés
            Article
            .find(query,options)
            .populate('author')
            .populate('categories')
            .exec(function(err, articles){
                // On contrôle s'il y a une erreur
                if(err) { return res.status(500).json(err); }
                // On renvoie le résultat
                return res.status(200).json({
                    articles: articles,
                    count: count,
                    skip: opts.skip,
                    limit: opts.limit,
                    sort: opts.sort
                });
            });
        });
    },
    
    // ******************************//
    // GETFEED
    // ******************************//
    getFeed: function(req, res) {
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) { return res.status(500).json(err); }
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
          
            // A-t-on un auteur ?
            if(typeof req.query.author !== 'undefined') {
                User.findOne({ username: req.query.author }).then(function(user) {
                    query.author = author._id;
                });
            }
          
            // A-t-on un categorie ?
            if(typeof req.query.category !== 'undefined') {
                Category.findOne({ title: req.query.category }).then(function(category) {
                    query.categories = {"$in" : [category._id] };
                });
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
           
            // On execute la requete d'abord
            Article.count(query).exec(function(err, count) {
                // On contrôle s'il y a une erreur
                if(err) { return res.status(500).json(err); }
                // On contrôle le résultat du comptage
                if(!count) { return res.status(500).json({ message: "An error occured while counting articles."}); }
                // On récupère les articles paginés
                Article
                .find(query,options)
                .populate('author')
                .populate('categories')
                .exec(function(err, articles) {
                    // On contrôle s'il y a une erreur
                    if(err) { return res.status(500).json(err); }
                    // On renvoie le résultat
                    return res.status(200).json({
                        articles: articles,
                        count: count,
                        skip: opts.skip,
                        limit: opts.limit,
                        sort: opts.sort
                    });
                });
            });
        });
    },

    // ******************************//
    // GETTAGS
    // ******************************//
    getTags: function(req, res) {
        Article
        .find({})
        .distinct('tags')
        .exec(function(err, tags) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // On renvoie la liste des tags
            return res.status(200).json(tags);
        });
    },

    // ******************************//
    // GETCOMMENTS
    // ******************************//
    getComments: function(req, res) {        
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
        .exec(function (err, article) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie l'article
            return res.status(200).json(article);
        });
    },

    // ******************************//
    // GETLIKES
    // ******************************//
    getLikes: function(req, res) {
        
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
        .exec(function (err, article) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // On contrôle l'article trouvé
            if (!article) { return res.sendStatus(404); }
            // On renvoie l'article
            return res.status(200).json(article);
        });
    },

    // ******************************//
    // CREATE
    // ******************************//
    create: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'article
            var article = new Article(req.body.article);          
            // On définit l'auteur
            article.author = user;          
            // On sauve l'article
            return article.save(function(err, article) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle l'article crée
                if(!article) return res.status(500).json({message: "An error occured while creating an article."});
                // On renvoie l'article crée
                return res.status(200).json(article);
            });
        });
    },

    // ******************************//
    // PUBLISH
    // ******************************//
    publish: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id,function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'article à modifier
            var article = req.body.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On recherche l'article
            Article.findByIdAndUpdate(article._id, { $set: { publishedAt: new Date() }}, function(err, artUpdated) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);  
                // On contrôle l'article trouvé
                if(!article) { return res.sendStatus(404); }
                // On crée un evenement
                Event.create({
                    type: 2,
                    priority: 2,
                    user: user._id,
                    source: {
                        kind: "article",
                        item: artUpdated._id
                    }
                },
                function(err, event) {
                    // On contrôle s'il y a une erreur
                    if(err) return res.status(500).json(err);
                    // On contrôle l'evenement crée
                    if(!event) return res.status(500).json({ messge: "An error occured while creating an article publishing event." });
                    // On renvoie un statut OK
                    return res.status(200).json(artUpdated);
                });
            })
        });
    },

    // ******************************//
    // EDIT
    // ******************************//
    edit: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'article à modifier
            var article = req.body.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On crée l'article
            Article.findByIdAndUpdate(article._id, article, function(err, artUpdated) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle l'article trouvé
                if(!article) { return res.sendStatus(404); }
                // On renvoie l'article mis à jour
                return res.status(200).json(artUpdated);
            })
        })
    },

    // ******************************//
    // DELETE
    // ******************************//
    delete:  function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'article à modifier
            var article = req.body.article;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(article.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'article
            Article.findByIdAndRemove(article._id,function(err, artDeleted) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On renvoie un statut OK
                return res.status(200).json(artDeleted);
            });
        });
    },

    // ******************************//
    // COMMENT
    // ******************************//
    comment: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }        
            // On crée le commentaire
            var comment = new Comment(req.body.comment);
            comment.author = user;        
            // On sauve le commentaire
            return Comment.create(comment, function(err, newComment) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle le commentaire crée
                if(!newComment) return res.status(500).json({ message: "An error occured while creating a comment."});
                // On ajoute le commentaire à l'article
                Article.findByIdAndUpdate(req.params.id, { $push: {'comments': newComment }}, function(err, artUpdated) {
                   // On contrôle s'il y a une erreur
                   if(err) return res.status(500).json(err);
                   // On contrôle l'article
                   if(!artUpdated) return res.status(500).json({ message: "An error occured while adding a comment to an article."});
                   // On crée un evenement
                   Event.create({
                       type: 17,
                       priority: 1,
                       user: user._id,
                       source: {
                           kind: "comment",
                           item: newComment._id
                        },
                        target: {
                            kind: "article",
                            item: artUpdated._id
                        },
                    },
                    function(err, event) {
                        // On contrôle s'il y a une erreur
                        if(err) return res.status(500).json(err);
                        // On contrôle l'evenement crée
                        if(!event) return res.status(500).json({ messge: "An error occured while creating an article comment event." });
                        // On renvoie un statut OK
                        return res.status(200).json(artUpdated);
                    });
                });
            });
        });
    },

    // ******************************//
    // UNCOMMENT
    // ******************************//
    uncomment: function(req, res) {
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére le commentaire à supprimer
            var comment = req.body.comment;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(comment.author.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'article
            Comment.findByIdAndRemove(comment._id,function(err, commentDeleted) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle le commentaire supprimé
                if(!commentDeleted) return res.status(500).json({ message: "An error occured while deleting a comment."});
                // On supprime le commenaire de l'article
                var article = req.body.article;
                Article.findByIdAndUpdate(article._id, { $pull: { comments: { _id: commentDeleted._id }}}, function(err, artUpdated){
                   // On contrôle s'il y a une erreur
                   if(err) return res.status(500).json(err);
                   // On contrôle l'article
                   if(!artUpdated) return res.status(500).json({ message: "An error occured while deleting an article comment."});
                   // On renvoie un statut OK
                   return res.status(200).json(artUpdated);
                });
            });
        });
    },

    // ******************************//
    // LIKE
    // ******************************//
    like: function(req, res){
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }                
            // On crée un like
            return Like.create({user: user }, function(err, like) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle le like crée
                if(!like) return res.status(500).json({ message: "An error occured while creating a like."});
                // On ajoute le commentaire à l'article
                Article.findByIdAndUpdate(req.params.id, { $push: {'likes': like }}, function(err, artUpdated) {
                   // On contrôle s'il y a une erreur
                   if(err) return res.status(500).json(err);
                   // On contrôle l'article
                   if(!artUpdated) return res.status(500).json({ message: "An error occured while adding a like to an article."});
                    // On crée un evenement
                    Event.create({
                        type: 18,
                        priority: 1,
                        user: user._id,
                        source: {
                            kind: "like",
                            item: like._id
                        },
                        target: {
                            kind: "article",
                            item: artUpdated._id
                        },
                     },
                    function(err, event) {
                        // On contrôle s'il y a une erreur
                        if(err) return res.status(500).json(err);
                        // On contrôle l'evenement crée
                        if(!event) return res.status(500).json({ messge: "An error occured while creating a like publishing event." });
                        // On renvoie un statut OK
                        return res.status(200).json(artUpdated);
                    });
                });
            });
        });
    },

    // ******************************//
    // UNLIKE
    // ******************************//
    unlike: function(res, req){
        // On recherche l'utilisateur authentifié
        User.findById(req.payload.id, function(err, user) {
            // On contrôle s'il y a une erreur
            if(err) return res.status(500).json(err);
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére le commentaire à supprimer
            var like = req.body.like;
            // On contrôle que l'utilisateur soit bien l'auteur
            if(like.user._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime le like
            Like.findByIdAndRemove(like._id,function(err, likeDeleted) {
                // On contrôle s'il y a une erreur
                if(err) return res.status(500).json(err);
                // On contrôle le like supprimé
                if(!likeDeleted) return res.status(500).json({ message: "An error occured while deleting a like."});
                // On supprime le like de l'article
                Article.findByIdAndUpdate(req.params.id, { $pull: { likes: { _id: likeDeleted._id }}}, function(err, artUpdated){
                    // On contrôle s'il y a une erreur
                    if(err) return res.status(500).json(err);
                    // On contrôle l'article mis a jour
                    if(!artUpdated) return res.status(500).json({ message: "An error occured while deleting an article like."});
                    // On renvoie un statut OK
                    return res.status(200).json(artUpdated);
                });
            });
        });
    }
};

