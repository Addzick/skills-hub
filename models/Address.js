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
    number: String,
    complement: String,
    zip: String,
    city: String,
    loc : { type: { type: String }, coordinates: [Number] },
}, { timestamps: true });

// On ajoute un index
AddressSchema.index({ loc: "2dsphere" });

// Défition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
AddressSchema.methods.toJSONFor = function() {
  return {
    _id: this._id.toString(),
    street: this.street,
    number: this.number,
    complement: this.complement,
    zip: this.zip,
    city: this.city,
    loc: this.loc,
    short: this.zip + ' ' + this.city,
    long: this.street + ', '+ this.number + ' ' + this.zip + ' ' + this.city,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Attribution du schéma au modèle d'utilisateur
module.exports = mongoose.model('address', AddressSchema);
