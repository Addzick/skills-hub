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
    type: { type: String, required: true },
    priority: { type: Number, required: true },    
    source: { kind : String, item: {type: mongoose.SchemaTypes.ObjectId, refPath: 'source.kind' } },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" }
}, { timestamps: true });

// Attribution du schéma au modèle d'évènement
module.exports = mongoose.model('Event', EventSchema);
