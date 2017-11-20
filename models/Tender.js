/*
  Fichier     : models/Tender.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à un appel d'offres
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'un appel d'offres
var TenderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,    
    medias: [String],
    isPrivate: Boolean,
    canAcceptPrivateProps: Boolean,
    workDate: Date,
    validityStart: Date,
    validityEnd: Date,
    address: {
        street: String,
        complement: String,
        zip: String,
        city: String,
        latitude: Number,
        longitude: Number,
    },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    category:{ type: mongoose.SchemaTypes.ObjectId, ref: "Category" },    
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Like" }],
    propositions:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Proposition" }],
    tasks:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" }],
    nbComments: Number,
    nbLikes: Number,
    nbPropositions: Number,
    nbTasks: Number,
    // Timestamps
    publishedAt: Date,
    closedAt: Date,
    canceledAt: Date, 
}, { timestamps: true });

// Attribution du schéma au modèle d'appel d'offres
module.exports = mongoose.model('Tender', TenderSchema);
