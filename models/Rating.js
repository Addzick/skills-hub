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
    rater:{ type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    rated : { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    concern:{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" },
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "Like" }],
    nbComments: Number,
    nbLikes: Number,
    // Timestamps
    publishedAt: Date,    
});

// Attribution du schéma au modèle de note
module.exports = mongoose.model('Rating', RatingSchema);
