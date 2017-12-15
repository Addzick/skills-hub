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
}, { timestamps: true });

// Défition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
CategorySchema.methods.toJSONFor = function(user) {
  return {
    _id: this._id.toString(),
    title: this.title,
    description: this.description,
    parent: this.parent,
    path: this.path,
    photo: this.photo,
    video: this.video,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isFavorite: user && user.isFavorite(this._id)
  };
};

// Attribution du schéma au modèle de categorie
module.exports = mongoose.model('category', CategorySchema);
