/*
  Fichier     : models/Comment.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un commentaire
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un commentaire
var CommentSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'user' },
  source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },
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

// Définition des hooks
CommentSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
CommentSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
CommentSchema.methods.autoload = function() {
  this
  .populate('author')
  .populate('source.item');
};

// Attribution du schéma au modèle de commentaire
module.exports = mongoose.model('comment', CommentSchema);
