/*
  Fichier     : controllers/search.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Contient les méthodes de recherche
*/

// Importation des ressources externes
var mongoose = require('mongoose');

export class BaseCtrl  {
    Model;

    constructor (model) {
        Model = model;
    }

    getQuery(req) {

        // On prépare un objet pour la requête
        var query = {};        
        
        // A-t-on un titre ?
        if(typeof req.query.title !== 'undefined' ) {
            query.title = { '$regex' : '.*' + req.query.title + '.*' };
        }

        // A-t-on un categorie ?
        if(typeof req.query.categories !== 'undefined') {
            query.category._id = { '$in' : req.query.categories };
        }

        // A-t-on un auteur ?
        if(typeof req.query.author !== 'undefined' ) {
            query.author._id = mongoose.Types.ObjectId(req.query.author);
        }

        // A-t-on un tag ?  
        if(typeof req.query.tags !== 'undefined' ) {
            query.tags = { '$in' : req.query.tags };
        }

        // On renvoie la requête préparée
        return query;
    }

    getOptions(req) {
        // On prépare un objet pour les options
        var opts = { skip: 0, limit: 20, sort: { createdAt: 'desc' } };

        // A-t-on un champ pour le tri ?
        if(typeof req.query.sort !== 'undefined') {
            opts.sort = req.query.sort;
        }      
        // A-t-on une limite ?
        if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
            opts.limit = Number(req.query.size);
        }

        // A-t-on une page ?
        if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
            opts.skip = Number((req.query.page - 1) * req.query.size);
        }

         // On renvoie les options
         return opts;
    }

    getChilds(req) {
        // On prépare un objet pour le remplissage des objets enfants
        var childs = {
            path: 'comments',
            options :{
                skip: 0,
                limit: 20,
                sort: { createdAt: 'desc' }
            }
        };

        // A-t-on un nom d'enfant ?
        if(typeof req.query.childs.path !== 'undefined') {
            childs.path = req.query.path;
        }

        // A-t-on une taille ?
        if(typeof req.query.childs.size  !== 'undefined' && req.query.childs.size >= 1) {
            childs.options.limit = Number(req.query.childs.size);
        }

        // A-t-on une page ?
        if(typeof req.query.childs.page !== 'undefined' && req.query.childs.page >= 1) {
            childs.options.skip = Number((req.query.childs.page - 1) * req.query.childs.size);
        }
    }

    getById(req, res, next) {
        // On récupére l'id passée en paramètre
        var id = req.params.id;

        // On execute la requête de sélection et on renvoie le résultat
        return this.Model
        .findById(id)
        .populate(getChilds(req))
        .exec()
        .then(function(ret) {
            // On contrôle le résultat
            if (!ret) { return res.sendStatus(404); }
            // On renvoie un statut OK avec le résultat
            return res.status(200).json(ret);
        }).catch(next);
    }

    getAll(req, res, next) {
        
        // On récupére les objets définissant la requête
        var query = this.getQuery(req);
        var opts = this.getOptions(req);
        var childs = this.getChilds(req);

        // On renvoie le résultat après execution des requêtes de sélection puis de comptage
        return Promise.all([
            this.Model
            .find(query, {}, opts)
            .populate(childs)
            .exec(),
            this.Model.count(query).exec(),            
        ])
        .then(function(results){
            var articles = results[0];
            var count = results[1];            
            return res.status(200).json({
                articles: articles,
                count: count,
                skip: opts.skip,
                limit: opts.limit,
                sort: opts.sort
            });
        }).catch(next);
    }
}