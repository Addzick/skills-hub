/*
  Fichier     : models/Rating.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une note
*/

// Importation des ressources externes
const mongoose = require('mongoose');

// Définition du schéma d'une note
var RatingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: String, 
    value: { type: Number, min:0, max:5, required: true},
    nbComments: Number,
    nbLikes: Number,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    target: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    concern: { type: mongoose.SchemaTypes.ObjectId, ref: "task" },
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
RatingSchema.methods.toJSONFor = function(user) {
 return {
    _id: this._id.toString(),
    title: this.title,
    body: this.body,
    value: this.value,
    nbComments: this.nbComments,
    nbLikes: this.nbLikes,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    target: this.target && user ? this.target.toJSONFor(user) : this.target,
    concern: this.concern && user ? this.concern.toJSONFor(user) : this.concern,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    myLike: this.likes.find(like => like && user.isMine(like.author._id)),
    canEdit: user && user.isMine(this.author._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('target')
  .populate('concern')
  .populate('likes', 'author');
  next(); 
};
RatingSchema.pre('findOneAndUpdate', autoPopulate);
RatingSchema.pre('findOne', autoPopulate);
RatingSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle de note
module.exports = mongoose.model('rating', RatingSchema);
