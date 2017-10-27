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
  author: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
}, {timestamps: true});

// Attribution du schéma au modèle de commentaire
mongoose.model('Comment', CommentSchema);
