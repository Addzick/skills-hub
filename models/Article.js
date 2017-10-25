/*
  Fichier     : models/Article.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un article
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

// Récupération du modèle Mongoose pour un utilisateur
var User = mongoose.model('User');

// Définition du schéma d'un article
var ArticleSchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  body: String,
  favoritesCount: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  tagList: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: Date
}, { timestamps: true });

// Définition du plugin utilisé pour la validation d'un champ unique
ArticleSchema.plugin(uniqueValidator, {message: 'is already taken'});

// Définition du traitement à executer avant validation
ArticleSchema.pre('validate', function(next){
  if(!this.slug)  {
    this.slugify();
  }
  next();
});

// Définition du traitement de "slugification"
ArticleSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

// Définition du traitement de mise à jour du nombre de favoris
ArticleSchema.methods.updateFavoriteCount = function() {
  var article = this;
  return User.count({favorites: {$in: [article._id]}}).then(function(count){
    article.favoritesCount = count;
    return article.save();
  });
};

// Définition de la méthode de transformation vers un objet JSON en intégrant les données de l'auteur
ArticleSchema.methods.toJSONFor = function(user){
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

// Attribution du schéma au modèle d'article
mongoose.model('Article', ArticleSchema);
