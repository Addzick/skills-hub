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

// Définition de la méthode de publication
PropositionSchema.methods.publish = function(){
    if(!this.publishedAt) {
        this.publishedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode d'acceptation
PropositionSchema.methods.accept = function(){
    if(!this.acceptedAt) {
        this.acceptedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode de rejet
PropositionSchema.methods.reject = function(){
    if(!this.rejectedAt) {
        this.rejectedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode d'annulation
PropositionSchema.methods.cancel = function(){
    if(!this.canceledAt) {
        this.canceledAt = Date.now;
    }
    return this.save();
};

// Attribution du schéma au modèle de proposition
module.exports = mongoose.model('Proposition', PropositionSchema);
