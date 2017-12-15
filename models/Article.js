/*
  Fichier     : models/Article.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un article
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');

// Définition du schéma d'un article
var ArticleSchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  body: String,
  tags: [String],
  medias: [String],
  nbComments: Number,
  nbLikes: Number,
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
  category: { type: mongoose.SchemaTypes.ObjectId, ref: 'category' },
  comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
  likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
}, { timestamps: true });

// Définition du plugin utilisé pour la validation d'un champ unique
ArticleSchema.plugin(uniqueValidator, { message: 'already exists' });

// Définition du traitement de "slugification"
ArticleSchema.methods.slugify = function() {
  if(!this.slug)  {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
  }
};

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
ArticleSchema.methods.toJSONFor = function(user) {
  const myLike = user ? this.likes.find(like => like && user.isMine(like.author._id)) : null;
  const canEdit = user && user.isMine(this.author._id);
  return {
    _id: this._id.toString(),
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    tags: this.tags,
    medias: this.medias,
    nbComments: this.nbComments,
    nbLikes: this.nbLikes,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    category: this.category && user ? this.category.toJSONFor(user) : this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    myLike: myLike,
    canEdit: canEdit
  };
};

// Définition des hooks
ArticleSchema.pre('validate', function(next) { 
  this.slugify(); 
  next();
});

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('category')
  .populate('likes', 'author');
  next(); 
};
ArticleSchema.pre('findOneAndUpdate', autoPopulate);
ArticleSchema.pre('findOne', autoPopulate);
ArticleSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle d'article
module.exports = mongoose.model('article', ArticleSchema);
