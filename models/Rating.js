/*
  Fichier     : models/Rating.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une note
*/

// Importation des ressources externes
var mongoose = require('mongoose');

// Définition du schéma d'une note
var RatingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: String, 
    value: { type: Number, min:0, max:5, required: true},
    // References
    rater:{ type: mongoose.SchemaType.ObjectId, ref: "User" },
    rated : { type: mongoose.SchemaType.ObjectId, ref: "User" },
    concern:{ type: mongoose.SchemaType.ObjectId, ref: "Task" },
    comments:[{ type: mongoose.SchemaType.ObjectId, ref: "Comment" }],
    likes:[{ type: mongoose.SchemaType.ObjectId, ref: "Like" }],
    // Timestamps
    publishedAt: Date,    
});

// Attribution du schéma au modèle de note
module.exports = mongoose.model('Rating', RatingSchema);
