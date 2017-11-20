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
    author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
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

// Attribution du schéma au modèle de like
module.exports = mongoose.model('Like', LikeSchema);
