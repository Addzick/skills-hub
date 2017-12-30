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

    preload(req, res, next) {
        const query = req.payload ? { _id: mongoose.Types.ObjectId(req.payload.id) }: {};
        
        return User.findOne(query).then(user => {
            var aggregations = [
                {   
                    $lookup:      
                    {        
                        from: "articles",
                        localField: "_id",
                        foreignField : "category",
                        as: "articles"
                    }
                },
                {   
                    $lookup:      
                    {        
                        from: "tenders",
                        localField: "_id",
                        foreignField : "category",
                        as: "tenders"
                    }
                },
                { $match: { _id: mongoose.Types.ObjectId(req.params.category) }},
                { $addFields: { nbArticles: { $size: "$articles" }, nbTenders: { $size: "$tenders" }}}
            ];

            if(user){
                aggregations.push({ $addFields: { isFavorite: { $in: [ "$_id", user.favorites ]}}});
            }
            aggregations.push({ $project: { articles:0, tenders:0 }});

            return Category.aggregate(aggregations).then(categories => {
                if(!categories) return res.sendStatus(404);
                req.category = categories[0];
                return next();
            });
        }).catch(next);
    }

    findOne(req, res, next) {
        return res.status(200).json({ category: req.category });
    }

    findAll(req, res, next) {
        const query = req.payload ? { _id: mongoose.Types.ObjectId(req.payload.id) }: {};
        
        return User.findOne(query).then(user => {
            var aggregations = [
                {   
                    $lookup:      
                    {        
                        from: "articles",
                        localField: "_id",
                        foreignField : "category",
                        as: "articles"
                    }
                },
                {   
                    $lookup:      
                    {        
                        from: "tenders",
                        localField: "_id",
                        foreignField : "category",
                        as: "tenders"
                    }
                },
                { $addFields: { nbArticles: { $size: "$articles" }, nbTenders: { $size: "$tenders" }}}
            ];

            if(user){
                aggregations.push({ $addFields: { isFavorite: { $in: [ "$_id", user.favorites ]}}});
            }
            aggregations.push({ $project: { articles:0, tenders:0 }});

            var sort = { $sort: { createdAt: 1 } };
            if(typeof req.query.sortBy !== 'undefined') { 
                sort.$sort[req.query.sortBy] = req.query.sortDir ==='desc' ? 1 : -1; 
            }
            aggregations.push(sort);
    
            if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
                aggregations.push({ $limit: Number(req.query.size) });
            }
            if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
                aggregations.push({ $skip: Number((req.query.page - 1) * req.query.size) });
            }

            return Category.aggregate(aggregations).then(categories => {
                return res.status(200).json({ categories: categories });
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