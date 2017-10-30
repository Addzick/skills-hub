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
    user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    target: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'target.kind' } },
}, { timestamps: true });

// Attribution du schéma au modèle de like
module.exports = mongoose.model('Like', LikeSchema);
