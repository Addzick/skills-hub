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
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  category: { type: mongoose.SchemaTypes.ObjectId, ref: 'Category' },
  comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Comment' }],
  likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Like' }],
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
ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' });

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

// Attribution du schéma au modèle d'article
mongoose.model('Article', ArticleSchema);
