/*
  Fichier     : routes/api/articles.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Contient la définition des routes d'accès à l'api de gestion des articles
*/

// Importation des ressources externes
var router = require('express').Router();
var mongoose = require('mongoose');

// Récupération des modèles Mongoose utilisés
var Article = mongoose.model('Article');
var Category = mongoose.model('Category');
var Comment = mongoose.model('Comment');
var Like = mongoose.model('Like');
var User = mongoose.model('User');

// Récupération de l'objet de traitement de l'authentification
var auth = require('../auth');

// Préchargement des objets 'Article' pour les routes contenant le paramètre ':article'
router.param('article', function(req, res, next, slug) {
  Article.findOne({ slug: slug})
    .populate('author')
    .populate('categories')
    .then(function (article) {
      if (!article) { 
        return res.sendStatus(404);
      }

      req.article = article;

      return next();
    }).catch(next);
});

// Préchargement des objets 'Comment' pour les routes contenant le paramètre ':comment'
router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { 
      return res.sendStatus(404); 
    }

    req.comment = comment;

    return next();
  }).catch(next);
});

// Préchargement des objets 'Like' pour les routes contenant le paramètre ':like'
router.param('like', function(req, res, next, id) {
  Like.findById(id).then(function(like){
    if(!like) { 
      return res.sendStatus(404); 
    }
    req.like = like;

    return next();

  }).catch(next);
});

// GET : http://<url-site-web:port>/api/articles/
// Renvoie la liste des articles après pagination
router.get('/', auth.optional, function(req, res, next) {
  var query = {};
  var opts = {
    skip: 0,
    limit: 20,
    sort: { createdAt: 'desc' }
  };

  // A-t-on un titre ?
  if(typeof req.query.title !== 'undefined' ){
    query.title = { "$regex" : '.*' + req.query.title + '.*' };
  }

  // A-t-on un auteur ?
  if(typeof req.query.author !== 'undefined') {
    User.findOne({ username: req.query.author }).then(function(user){
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
  if(typeof req.query.tag !== 'undefined' ){
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
  
  return Promise.all([
    Article.find(query,options)
      .populate('author')
      .populate('categories')
      .exec(),
    Article.count(query).exec()
  ]).then(function(results){
    var articles = results[0];
    var count = results[1];
    return res.json({
      articles: articles,
      count: count,
      skip: opts.skip,
      limit: opts.limit,
      sort: opts.sort
    });
  }).catch(next);
  
});

// GET : http://<url-site-web:port>/api/articles/feed
// Renvoie les articles publiés par les utilisateurs suivis par l'utilisateur authentifié
router.get('/feed', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var query = {
      categories: { '$in': user.categories }
    };
    var opts = {
      skip: 0,
      limit: 20,
      sort: { createdAt: 'desc' }
    };
  
    // A-t-on un titre ?
    if(typeof req.query.title !== 'undefined' ){
      query.title = { "$regex" : '.*' + req.query.title + '.*' };
    }
  
    // A-t-on un auteur ?
    if(typeof req.query.author !== 'undefined') {
      User.findOne({ username: req.query.author }).then(function(user){
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

    Promise.all([
      Article.find(query,opts)
      .populate('author')
      .populate('categories')
      .exec(),
      Article.count(query).exec()])
      .then(function(results ){
        var articles = results[0];
        var count = results[1];
        return res.json({
          articles: articles,
          count: count,
          page: Number((opts.skip / opts.limit) + 1),
          size: opts.limit,
          sort: opts.sort
        });
      }).catch(next);
  });
});

// GET : http://<url-site-web:port>/api/articles/tags/
// Renvoie la liste complète des tags de tous les articles postés
router.get('/tags', function(req, res, next) {
  Article.find().distinct('tags').then(function(tags){
    return res.json({tags: tags});
  }).catch(next);
});

// GET : http://<url-site-web:port>/api/articles/:article
// Renvoie l'article correspondant
router.get('/:article', auth.optional, function(req, res, next) {
  return res.status(200).json(req.article);
});

// POST : http://<url-site-web:port>/api/articles/:article
// Crée un article
router.post('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    var article = new Article(req.body.article);

    article.author = user;

    return article.save().then(function(){
      console.log(article.author);
      return res.json({article: article.toJSONFor(user)});
    });
  }).catch(next);
});

// PUT : http://<url-site-web:port>/api/articles/:article
// Met à jour l'article correspondant
router.put('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(req.article.author._id.toString() === req.payload.id.toString()){
      if(typeof req.body.article.title !== 'undefined'){
        req.article.title = req.body.article.title;
      }

      if(typeof req.body.article.description !== 'undefined'){
        req.article.description = req.body.article.description;
      }

      if(typeof req.body.article.body !== 'undefined'){
        req.article.body = req.body.article.body;
      }

      if(typeof req.body.article.tagList !== 'undefined'){
        req.article.tagList = req.body.article.tagList
      }

      req.article.save().then(function(article){
        return res.json({article: article.toJSONFor(user)});
      }).catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// DELETE : http://<url-site-web:port>/api/articles/:article
// Supprime un article existant
router.delete('/:article', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    if(req.article.author._id.toString() === req.payload.id.toString()){
      return req.article.remove().then(function(){
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  }).catch(next);
});


// GET : http://<url-site-web:port>/api/articles/:article/comments
// Renvoie la liste complète des commentaires d'un article
router.get('/:article/comments', auth.optional, function(req, res, next){
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user){
    return req.article.populate({
      path: 'comments',
      populate: {
        path: 'author'
      },
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    }).execPopulate().then(function(article) {
      return res.json({comments: req.article.comments.map(function(comment){
        return comment.toJSONFor(user);
      })});
    });
  }).catch(next);
});

// POST : http://<url-site-web:port>/api/articles/:article/comments
// Ajout un nouveau commentaire à l'article correspondant
router.post('/:article/comments', auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    var comment = new Comment(req.body.comment);
    comment.article = req.article;
    comment.author = user;

    return comment.save().then(function(){
      req.article.comments.push(comment);

      return req.article.save().then(function(article) {
        res.json({comment: comment.toJSONFor(user)});
      });
    });
  }).catch(next);
});

// DELETE : http://<url-site-web:port>/api/articles/:article/comments
// Supprime un commentaire de l'article correspondant
router.delete('/:article/comments/:comment', auth.required, function(req, res, next) {
  if(req.comment.author.toString() === req.payload.id.toString()){
    req.article.comments.remove(req.comment._id);
    req.article.save()
      .then(Comment.find({_id: req.comment._id}).remove().exec())
      .then(function(){
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

// Exportation du router
module.exports = router;
