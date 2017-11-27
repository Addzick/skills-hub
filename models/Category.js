/*
  Fichier     : models/Category.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une categorie
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une categorie
var CategorySchema = new mongoose.Schema({
    name: String,
    title: String,
    description: String,
    parent: String,
    path: String,
    photo: String,
    video: String,
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

// Attribution du schéma au modèle de categorie
module.exports = mongoose.model('category', CategorySchema);
