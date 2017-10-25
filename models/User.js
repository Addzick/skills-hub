/*
  Fichier     : models/User.js
  Auteur      : Youness FATH
  Date        : 24.10.2017
  Description : Définition du modèle DB correspondant à un utilisateur
*/

// Importation des ressources externes
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

// Récupération de la phrase secrète depuis le fichier de configuration
var secret = require('../config').secret;

// Définition du schéma d'un utilisateur
var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  lastname: String,
  firstname: String,
  bio: String,
  image: String,
  address: {
    street: String,
    complement: String,
    zip: String,
    city: String,
    latitude: Number,
    longitude: Number,
  },      
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hash: String,
  salt: String
}, {timestamps: true});

// Définition du plugin utilisé pour la validation des champs uniques
UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

// Définition de la méthode utilisée pour mettre à jour le mot de passe d'un utilisateur
UserSchema.methods.setPassword = function(password){
  // Calcul du salt
  this.salt = crypto.randomBytes(16).toString('hex');
  // Calcul du hash du password
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

// Définition de la méthode utilisée pour la validation d'un mot de passe
UserSchema.methods.validPassword = function(password) {
  // Calcul du hash identique au calcul fait lors de la mise à jour du mot de passe
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  // On compare les 2 hash pour définir si le mot de passe est valide
  return this.hash === hash;
};

// Définition de la méthode de génération d'un JSON Web Token
UserSchema.methods.generateJWT = function() {
  // Préparation des variables
  var today = new Date();
  var exp = new Date(today);

  // Par défaut le token expire au bout de 60 jours
  exp.setDate(today.getDate() + 60);

  // On signe le web token avec la phrase secrète avant de le renvoyer
  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

// Définition de la méthode utilisée pour representer un utilisateur authentifé
UserSchema.methods.toAuthJSON = function(){
  return {
    username: this.username,
    email: this.email,
    lastname: this.lastname,
    firstname: this.firstname,
    bio: this.bio,
    image: this.image,
    address: {
      street: this.address.street,
      zip: this.address.zip,
      city: this.address.city,
      latitude: this.address.latitude,
      longitude: this.address.longitude
    },
    token: this.generateJWT(),
  };  
};

// Définition de la méthode utilisée pour representer un profil utilisateur
UserSchema.methods.toProfileJSONFor = function(user){
  return {
    username: this.username,
    email: this.email,
    lastname: this.lastname,
    firstname: this.firstname,
    bio: this.bio,
    image: this.image,
    address: {
      street: this.address.street,
      zip: this.address.zip,
      city: this.address.city,
      latitude: this.address.latitude,
      longitude: this.address.longitude
    },
    following: user ? user.isFollowing(this._id) : false
  };
};

// Définition de la méthode d'ajout d'un article favori
UserSchema.methods.favorite = function(id){
  if(this.favorites.indexOf(id) === -1){
    this.favorites.push(id);
  }
  return this.save();
};

// Définition de la méthode de suppression d'un article favori
UserSchema.methods.unfavorite = function(id){
  this.favorites.remove(id);
  return this.save();
};

// Définition de la méthode de contrôle si l'article est déjà un favori
UserSchema.methods.isFavorite = function(id){
  return this.favorites.some(function(favoriteId){
    return favoriteId.toString() === id.toString();
  });
};

// Définition de la méthode d'ajout de suivi d'un utilisateur
UserSchema.methods.follow = function(id){
  if(this.following.indexOf(id) === -1){
    this.following.push(id);
  }
  return this.save();
};

// Défintion de la méthode de suppression de suivi d'un utilisateur
UserSchema.methods.unfollow = function(id){
  this.following.remove(id);
  return this.save();
};

// Définition de la méthode de contrôle si l'utilisateur est déjà suivi
UserSchema.methods.isFollowing = function(id){
  return this.following.some(function(followId){
    return followId.toString() === id.toString();
  });
};

// Attribution du schéma au modèle d'utilisateur
mongoose.model('User', UserSchema);
