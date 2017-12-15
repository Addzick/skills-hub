/*
  Fichier     : controllers/categories.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Définit le controleur de gestion des categories
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');
const Category = mongoose.model('category');
const User = mongoose.model('user');

// Définition du controleur
class CategoryCtrl {

    constructor() {
    }

    findAll(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            Category.find({}).exec()
        ]).then(function(results) {
            return res.status(200).json({ 
                categories: results[1].map((cat) => cat.toJSONFor(results[0])) 
            });
        }).catch(next);
    }

    findOne(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(), 
            Category.findOne({ _id: mongoose.Types.ObjectId(req.params.category)}).exec()
        ]).then(function(results) {
            if(!categories) return res.sendStatus(404);
            return res.status(200).json({ 
                category: results[1].toJSONFor(results[0]) 
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.get('/', auth.optional, this.findAll);
        router.get('/:category', auth.optional, this.findOne);
        return router;
    }
}

module.exports = new CategoryCtrl();