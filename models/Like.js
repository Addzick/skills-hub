/*
  Fichier     : models/Like.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un like
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un like
var LikeSchema =  new mongoose.Schema({
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
LikeSchema.post('findOne', function(doc,next) { doc.autoload(); next(); });
LikeSchema.post('find', function(docs,next) { 
  for(i=0; i < docs.length; i++) {
    docs[i].autoload();
  }
  next(); 
});

// Définition du traitement de population
LikeSchema.methods.autoload = function() {
  this
  .populate('author')
  .populate('source.item');
};

// Attribution du schéma au modèle de like
module.exports = mongoose.model('like', LikeSchema);
