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

// Définition du schéma d'un article
var ArticleSchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  body: String,
  tags: [String],
  medias: [String],
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
  category: { type: mongoose.SchemaTypes.ObjectId, ref: 'category' },
  comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'comment' }],
  likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'like' }],
  nbComments: Number,
  nbLikes: Number,
  publishedAt: Date
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      delete ret.__v;
    }
  }
});

// Définition du plugin utilisé pour la validation d'un champ unique
ArticleSchema.plugin(uniqueValidator, { message: 'already exists' });

// Définition des hooks
ArticleSchema
.pre('validate', slugify)
.pre('findOne', autoload)
.pre('find', autoload);

// Définition du traitement de "slugification"
ArticleSchema.methods.slugify = function(next) {
  if(!this.slug)  {
    this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
  }
  next();
};

// Définition du traitement de population
ArticleSchema.methods.autoload = function(next) {
  this
  .populate('author')
  .populate('category');
  next();
};

// Attribution du schéma au modèle d'article
mongoose.model('article', ArticleSchema);
