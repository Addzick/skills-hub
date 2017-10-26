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

// Attribution du schéma au modèle de tâche
module.exports = mongoose.model('Task', TaskSchema);
