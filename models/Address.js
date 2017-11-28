/*
  Fichier     : models/Address.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Définition du modèle DB correspondant à une adresse
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un utilisateur
var AddressSchema = new mongoose.Schema({
    street: String,
    complement: String,
    zip: String,
    city: String,
    loc : { type: { type: String }, coordinates: [Number] },
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret){
      delete ret.__v;
      ret.short = doc.zip + ' ' + doc.city;
      ret.long = doc.street + ' ' + doc.zip + ' ' + doc.city;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      delete ret.__v;
      ret.short = doc.zip + ' ' + doc.city;
      ret.long = doc.street + ' ' + doc.zip + ' ' + doc.city;
    }
  }
});

// On ajoute un index
AddressSchema.index({ loc: "2dsphere" });

// Attribution du schéma au modèle d'utilisateur
module.exports = mongoose.model('address', AddressSchema);
