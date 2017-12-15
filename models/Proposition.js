/*
  Fichier     : models/Proposition.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définition du modèle DB correspondant à une proposition
*/

// Importation des ressources externes
const mongoose = require('mongoose');

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
    nbComments: Number,
    nbLikes: Number,
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
    source: { type: mongoose.SchemaTypes.ObjectId, ref: "tender" },
    likes:[{ type: mongoose.SchemaTypes.ObjectId, ref: "like" }],
    comments:[{ type: mongoose.SchemaTypes.ObjectId, ref: "comment" }],
    acceptedAt: Date,
    rejectedAt: Date,
    canceledAt: Date,
}, { timestamps: true });

// Définition du traitement pour le retour d'un objet JSON pour un utilisateur spécifié
PropositionSchema.methods.toJSONFor = function(user) {
  const myLike = this.likes.find(like => like && user && user.isMine(like.author._id));
  const isOpened = !this.acceptedAt && !this.rejectedAt && !this.canceledAt;
  const isValid = this.validityStart && this.validityEnd && this.validityStart >= Date.now() && this.validityEnd <= Date.now();
  const canEdit = isOpened && user && user.isMine(this.author._id);
  const canAcceptOrReject = isOpened && !this.source.closedAt && !this.source.canceledAt && user && user.isMine(this.source.author._id);
  return {
    _id: this._id.toString(),
    title: this.title,
    description: this.description,
    amount: this.amount,
    isPrivate: this.isPrivate,
    estimedTime: this.estimedTime,
    timeUnit: this.timeUnit,
    workDate: this.workDate,
    validityStart: this.validityStart,
    validityEnd: this.validityEnd,
    nbComments: this.nbComments,
    nbLikes: this.nbLikes,
    author: this.author && user ? this.author.toJSONFor(user) : this.author,
    source: this.source && user ? this.source.toJSONFor(user): this.source,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    acceptedAt: this.acceptedAt,
    rejectedAt: this.rejectedAt,
    canceledAt: this.canceledAt,
    myLike: myLike,
    isValid: isValid,
    canEdit: canEdit,
    canAcceptOrReject: canAcceptOrReject
  };
};

// Définition des hooks
var autoPopulate = function(next) {
  this
  .populate('author')
  .populate('source')
  .populate('likes', 'author');
  next(); 
};
PropositionSchema.pre('findOneAndUpdate', autoPopulate);
PropositionSchema.pre('findOne', autoPopulate);
PropositionSchema.pre('find', autoPopulate);

// Attribution du schéma au modèle de proposition
module.exports = mongoose.model('proposition', PropositionSchema);
