/*
  Fichier     : models/Task.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une tâche
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une tâche
var TaskSchema =  new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    amount: Number,
    completionDate: Date,
    completionTime: Number,
    timeUnit:{ type: String, enum: ["ss","mm", "hh", "dd"] },
    onSite: Boolean,
    materialIsSupplied: Boolean,    
    // References
    worker: { type: mongoose.SchemaType.ObjectId, ref: "User" },
    customer:{ type: mongoose.SchemaType.ObjectId, ref: "Tender" },    
    // Timestamps
    publishedAt: Date,
    confirmedAt: Date,
    paidAt: Date,
    canceledAt: Date,
}, { timestamps: true });

// Définition de la méthode de publication
TaskSchema.methods.publish = function(){
    if(!this.publishedAt) {
        this.publishedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode de confirmation
TaskSchema.methods.confirm = function(){
    if(!this.confirmedAt) {
        this.confirmedAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode de paiement
TaskSchema.methods.pay = function(){
    if(!this.paidAt) {
        this.paidAt = Date.now;
    }
    return this.save();
};

// Définition de la méthode d'annulation
TaskSchema.methods.cancel = function(){
    if(!this.canceledAt) {
        this.canceledAt = Date.now;
    }
    return this.save();
};

// Attribution du schéma au modèle de tâche
module.exports = mongoose.model('Task', TaskSchema);
