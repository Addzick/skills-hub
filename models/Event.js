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
      0,  // Nouvel utilisateur
      1,  // Connexion d'un utilisateur
      2,  // Déconnexion d'un utilisateur
      3,  // Publication d'un article
      4,  // Publication d'un appel d'offres
      5,  // Cloture d'un appel d'offres
      6,  // Annulation d'un appel d'offres
      7,  // Publication d'une proposition
      8,  // Acceptation d'une proposition
      9,  // Rejet d'une proposition
      10, // Annulation d'une proposition
      11, // Création d'une tâche
      12, // Confirmation d'une tâche
      13, // Réalisation d'une tâche
      14, // Paiement d'une tâche
      15, // Annulation d'une tâche
      16, // Pulication d'une évaluation
      17, // Publication d'un commentaire
      18, // Publication d'un like 
    ] },
    priority: { type: Number, required: true, min: 0, max: 2 },    
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },
    target: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'target.kind' } },
}, { timestamps: true });

// Attribution du schéma au modèle d'évènement
module.exports = mongoose.model('Event', EventSchema);
