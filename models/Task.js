/*
  Fichier     : models/Task.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une tâche
*/

// Importation des ressources externes
const mongoose = require('mongoose');

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
    nbComments: Number,
    nbLikes: Number,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    concern: { type: mongoose.SchemaTypes.ObjectId, ref: "tender" },
    publishedAt: Date,
    confirmedAt: Date,
    paidAt: Date,
    canceledAt: Date,
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
TaskSchema.methods.toJSONFor = function(user) {
  return {
    _id: this._id.toString(),
    description: this.description,
    amount: this.amount,
    completionDate: this.completionDate,
    completionTime: this.completionTime,
    timeUnit: this.timeUnit,
    onSite: this.onSite,
    materialIsSupplied: this.materialIsSupplied,   
    nbComments: this.nbComments,
    nbLikes: this.nbLikes,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    concern: this.concern && user ? this.concern.toJSONFor(user) : this.concern,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    confirmedAt: this.confirmedAt,
    paidAt: this.paidAt,
    canceledAt: this.canceledAt,
    canEdit: !this.confirmedAt && !this.paidAt && user && user.isMine(this.author._id),
    canConfirm: !this.confirmedAt && !this.paidAt && !this.canceledAt && user && user.isMine(this.author._id),
    canPay: this.confirmedAt && !this.paidAt && !this.canceledAt && user && user.isMine(this.concern.author._id)
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('concern');
  next(); 
};
TaskSchema.pre('findOneAndUpdate', autoPopulate);
TaskSchema.pre('findOne', autoPopulate);
TaskSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle de tâche
module.exports = mongoose.model('task', TaskSchema);
