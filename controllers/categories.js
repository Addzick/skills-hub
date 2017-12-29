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
const Tender = mongoose.model('tender');

// Définition du controleur
class CategoryCtrl {

    constructor() {
    }

    preload(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(), 
            Category.findOne({ _id: mongoose.Types.ObjectId(req.params.category)}).exec()
        ]).then(function(results) {
            if(!results) return res.sendStatus(404);
            req.category = results[1].toJSONFor(results[0]);
            return next();
        }).catch(next);
    }

    findOne(req, res, next) {
        return res.status(200).json({ category: req.category });
    }

    findAll(req, res, next) {
        var opts = { skip: 0, limit: 20, sort: { createdAt: 'desc' } };
        if(typeof req.query.sortBy !== 'undefined') { 
            opts.sort[req.query.sortBy] = req.query.sortDir || 'asc'; 
        }
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        }
        
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(),
            Category.find({}, {}, opts).exec(),
            Tender.aggregate([{
                $group : {
                    _id : "$category",
                    "count" :  { $sum : 1 }
                }
            }]).exec()
        ]).then(function(results) {
            var user = results[0];
            var categories = results[1];
            var counts = results[2];
            return res.status(200).json({
                categories: categories.map((category) => {
                    const cat = category.toJSONFor(user);
                    const nb = counts.find(t => t._id.toString() == cat._id.toString());
                    if(nb && typeof nb != 'undefined') {
                        cat.nbTenders = nb.count;
                    }
                    return cat;
                })
            });
        }).catch(next);
    }

    getRoutes() {
        var router = require('express').Router();
        router.param('category', this.preload);
        router.get('/', auth.optional, this.findAll);
        router.get('/:category', auth.optional, this.findOne);
        return router;
    }
}

module.exports = new CategoryCtrl();