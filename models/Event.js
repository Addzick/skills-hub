/*
  Fichier     : models/Event.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un evenement
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un évènement
var EventSchema =  new mongoose.Schema({
    type: { type: Number, required: true, enum: [
      //-------------------------------//
      // Gestion des utilisateurs
      //-------------------------------//
      0,  // Nouvel utilisateur
      1,  // Connexion d'un utilisateur
      2,  // Déconnexion d'un utilisateur
      3,  // Edition d'un utilisateur
      //-------------------------------//
      // Gestion des articles
      //-------------------------------//
      4,  // Creation d'un article
      5,  // Edition d'un article
      6,  // Publication d'un article
      7,  // Suppression d'un article      
      
    ] },
    priority: { type: Number, required: true, min: 0, max: 2 },    
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } }    
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

// Attribution du schéma au modèle d'évènement
module.exports = mongoose.model('Event', EventSchema);
