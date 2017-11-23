/*
  Fichier     : controllers/base.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion de documents MongoDB
*/

// Importation des ressources externes
const auth = require('../config/auth');
const mongoose = require('mongoose');
const User = mongoose.model('user');
const Category = mongoose.model('category');
const Event = mongoose.model('event');
const Comment = mongoose.model('comment');
const Like = mongoose.model('like');

// Définition du controleur de base
module.exports = class PublicationCtrl {   

    constructor() {}

    getQueryFromRequest(req) {
        
        // On prépare un objet
        var query = {};

        // A-t-on un auteur ?
        if(typeof req.query.author !== 'undefined' ) {
            query.author = { _id : mongoose.Types.ObjectId(req.query.author) };
        }

        // A-t-on un titre ?
        if(typeof req.query.title !== 'undefined' ) {
            query.title = { $regex : '.*' + req.query.title + '.*' };
        }

        // A-t-on un categorie ?
        if(typeof req.query.categories !== 'undefined') {
            query.category = { $in : req.query.categories };
        }

        // A-t-on une période ?
        if(typeof req.query.startDate !== 'undefined' && typeof req.query.endDate !== 'undefined') {
            query.updatedAt = { 
                $gte: new ISODate(req.query.startDate),
                $lte: new ISODate(req.query.endDate)
            }
        }

        // On renvoie l'objet
        return query;
    }

    getOptionsFromRequest(req) {
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

    getChildsFromRequest(req) {
        
        var childs = {};
        
        if(typeof req.query.childs.path !== 'undefined') {
            childs = {
                path: req.query.childs.path,
                options : {
                    skip: 0,
                    limit: 20
                }
            };
        
            if(typeof req.query.childs.size  !== 'undefined' 
            && typeof req.query.childs.page !== 'undefined' 
            && req.query.childs.size >= 1
            && req.query.childs.page >= 1) {
                childs.options.limit = Number(req.query.childs.size);
                childs.options.skip = Number((req.query.childs.page - 1) * req.query.childs.size);
            }

            if(typeof req.query.childs.sort !== 'undefined') {
                childs.options.sort = req.query.childs.sort;
            }
        }

        return childs;
    }

    preload(req, res, next, name) {
        // On recherche l'appel d'offres correspondant
        return mongoose.model(name)
        .findOne({ _id: mongoose.Types.ObjectId(req.params[name]) })
        .then(function(result) {
            // Si aucun item trouvé, on renvoie une erreur 404
            if(!result) { console.log(`${ name } not found`); return res.sendStatus(404); }
            // On remplit la requête avec l'item trouvé
            req[name] = result;
            // On continue l'execution
            return next();
        }).catch(next);
    }

    preloadCategory(req, res, next) {
        // On recherche la categorie correspondante
        return Category
        .findOne({_id: mongoose.Types.ObjectId(req.params.category)})
        .then(function(category){
            // Si aucune catégorie trouvée, on renvoie une erreur 404
            if(!category) { return res.sendStatus(404); }        
            // On remplit la requête avec la catégorie trouvée
            req.category = category;
            // On continue l'execution
            return next();
          }).catch(next);
    }

    preloadComment(req, res, next) {
        // On recherche le commentaire correspondant
        return Comment
        .findOne({_id: mongoose.Types.ObjectId(req.params.comment)})
        .then(function(comment){
            // Si aucun commentaire trouvé, on renvoie une erreur 404
            if(!comment) { return res.sendStatus(404); }        
            // On remplit la requête avec le commentaire trouvé
            req.comment = comment;
            // On continue l'execution
            return next();
          }).catch(next);
    }

    preloadLike(req, res, next) {
        // On recherche le like correspondant
        return Like
        .findOne({_id: mongoose.Types.ObjectId(req.params.like)})
        .then(function(like) {
            // Si aucun like trouvé, on renvoie une erreur 404
            if(!like) { return res.sendStatus(404); }        
            // On remplit la requête avec le like trouvé
            req.like = like;
            // On continue l'execution
            return next();
          }).catch(next);
    }

    findOne(req, res, next, name) {
        // On execute la requête de sélection et on renvoie le résultat
        return mongoose.model(name)
        .findOne({_id: mongoose.Types.ObjectId(req.params[name])})
        .populate(this.getChildsFromRequest(req))
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ item : ret });
        }).catch(next);
    }

    findAll(req, res, next, name) {
        // On renvoie le résultat après execution de la requête de sélection
        return mongoose.model(name)
        .find(this.getQueryFromRequest(req), {}, this.getOptionsFromRequest(req))
        .populate(this.getChildsFromRequest(req))
        .exec().then(function(items) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut OK et les items trouvés
            return res.status(200).json({ items: items  });
        }).catch(next);
    }

    count(req, res, next, name) {
        // On compte et on renvoie le résultat du comptage
        return mongoose.model(name)
        .count(this.getQueryFromRequest(req))
        .then(function(result) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut Ok et le résultat du comptage
            return res.status(200).json({ count: result  });
        }).catch(next);
    }

    create(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'item
            var model = mongoose.model(name)
            var item = new model(req.body[name]);
            // On définit l'auteur
            item.author = user;
            // On crée l'item
            return model.create(item).then(function(newItem) {
                 // On crée un evenement
                 return Event
                 .newEvent(`${ name }_created`, user, { kind: name, item: newItem })
                 .then(function() {
                     var result = {};
                     result[name] = newItem;
                     return res.status(200).json(result);
                 });
            });
        }).catch(next);
    }

    edit(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[name].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On met à jour l'item
            return mongoose.model(name)
            .findOneAndUpdate({_id: item._id }, { $set: req.body[name] }, { new: true })
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ name }_updated`, user, { kind: name, item: newItem })
                .then(function() {
                    var result = {};
                    result[name] = newItem;
                    return res.status(200).json(result);
                 });
            });
        }).catch(next);
    }

    publish(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'item préchargé
            var item = req[name];
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return mongoose.model(name)
            .findOneAndUpdate({_id: item._id }, {$set: { publishedAt: Date.now() }})
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ name }_published`, user, { kind: name, item: newItem })
                .then(function() {
                    var result = {};
                    result[name] = newItem;
                    return res.status(200).json(result);
                 });
            });
        }).catch(next);
    }

    delete(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[name].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'item
            return mongoose.model(name)
            .findByIdAndRemove(article._id)
            .then(function(itemDeleted) {
                // On crée un evenement
                return Event
                .newEvent(`${ name }_deleted`, user, { kind: name, item: itemDeleted })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    comment(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du commentaire
            var source = req[name];
            // On crée un commentaire            
            return Comment.create({ 
                body: req.body.comment.body, 
                author: user,
                source: { kind: name, item: source }
             }).then(function(comment) {                
                // On ajoute le commentaire à la source
                return mongoose.model(name)
                .findOneAndUpdate({ _id: source._id }, { $push: { comments: comment }, $inc: { nbComments : 1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ name }_commented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.status(200).json({ comment: comment });
                    });
                });
            });
        }).catch(next);
    }

    uncomment(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été trouvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[name];
            // On supprime le commentaire
            return Comment.findByIdAndRemove(req.comment._id).then(function(comment) {
                // On supprime le lien avec la source
                return mongoose.model(name)
                .findOneAndUpdate({ _id: source._id }, { $pull: { comments: comment }, $inc: { nbComments : -1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ name }_uncommented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    like(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du like
            var source = req[name];
            // On crée un like            
            return Like
            .create({ 
                author: user,
                source: { kind: name, item: source }
             })
             .then(function(like) {                
                // On ajoute le like à la source
                return mongoose.model(name)
                .findOneAndUpdate({_id: source._id }, { $push: { likes: like }, $inc: { nbLikes : 1 } })
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ name }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.status(200).json({ like: like });
                    });
                });
            });
        }).catch(next);
    }

    unlike(req, res, next, name) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[name];
            // On supprime le like
            return Like
            .findByIdAndRemove(req.like._id)
            .then(function(like) {
                // On supprime le lien avec la source
                return mongoose.model(name).findOneAndUpdate({ _id: source._id }, { $pull: { likes: like }, $inc: { nbLikes : -1 }})
                .then(function() {
                    // On crée un evenement
                    Event
                    .newEvent(`${ name }_unliked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    getRoutes(name) {
        var router = require('express').Router();
        router.param(`${ name }`, this.preload);
        router.param('comment', this.preloadComment);
        router.param('like', this.preloadLike);
        router.param('category', this.preloadCategory);
        router.get('/', auth.optional, this.findAll);
        router.get('/count', auth.optional, this.count);
        router.get(`/:${ name }`, auth.optional, this.findOne);
        router.post('/create', auth.required, this.create);
        router.post(`/:${ name }/edit`, auth.required, this.edit);
        router.post(`/:${ name }/publish`, auth.required, this.publish);
        router.delete(`/:${ name }/delete`, auth.required, this.delete);
        router.post(`/:${ name }/comment`, auth.required, this.comment);
        router.delete(`/:${ name }/:comment`, auth.required, this.uncomment);
        router.post(`/:${ name }/like`, auth.required, this.like);
        router.delete(`/:${ name }/:like`, auth.required, this.unlike);
        return router;
    }
}
