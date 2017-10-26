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
    applicant: { type: mongoose.SchemaType.ObjectId, ref: "User" },
    category:{ type: mongoose.SchemaType.ObjectId, ref: "Category" },    
    comments:[{ type: mongoose.SchemaType.ObjectId, ref: "Comment" }],
    likes:[{ type: mongoose.SchemaType.ObjectId, ref: "Like" }],
    // Timestamps
    publishedAt: Date,
    closedAt: Date,
    canceledAt: Date, 
}, { timestamps: true });

// Définition de la méthode de publication
TenderSchema.methods.publish = function(){
    if(!this.publishedAt) {
        this.publishedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode de cloture
TenderSchema.methods.close = function(){
    if(!this.closedAt) {
        this.closedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode d'annulation
TenderSchema.methods.cancel = function(){
    if(!this.canceledAt) {
        this.canceledAt = Date.now;
    }
    return this.save();
};

// Attribution du schéma au modèle d'appel d'offres
module.exports = mongoose.model('Tender', TenderSchema);
