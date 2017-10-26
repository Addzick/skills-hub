/*
  Fichier     : models/Proposition.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une proposition
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une proposition
var PropositionSchema =  new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    amount: Number,
    isPrivate: Boolean,
    estimedTime: Number,
    timeUnit: { type: String, enum: ["ss","mm", "hh", "dd"]},
    workDate: Date,
    validityStart: Date,
    validityEnd: Date,    
    bidder: { type: mongoose.SchemaType.ObjectId, ref: "User" },
    tender: { type: mongoose.SchemaType.ObjectId, ref: "Tender" },    
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    publishedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    canceledAt: Date,
});

// Attribution du schéma au modèle de proposition
module.exports = mongoose.model('Proposition', PropositionSchema);
