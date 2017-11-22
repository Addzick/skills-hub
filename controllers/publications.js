/*
  Fichier     : controllers/base.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion de documents MongoDB
*/

// Importation des ressources externes
const mongoose = require('mongoose');
const auth = require('../config/auth');

class PublicationCtrl {   

    constructor(modelName) {
        PublicationCtrl.ModelName = modelName;
        PublicationCtrl.Model = mongoose.model(modelName);
        PublicationCtrl.User = mongoose.model('user');
        PublicationCtrl.Category = mongoose.model('category');
        PublicationCtrl.Event = mongoose.model('event');
        PublicationCtrl.Comment = mongoose.model('comment');
        PublicationCtrl.Like = mongoose.model('like');
      }

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
                path: req.query.path,
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

    preload(req, res, next) {
        // On recherche l'appel d'offres correspondant
        return PublicationCtrl.Model
        .findOne({ _id: mongoose.Types.ObjectId(req.params[PublicationCtrl.ModelName]) })
        .then(function(result) {
            // Si aucun item trouvé, on renvoie une erreur 404
            if(!result) { console.log(`${ PublicationCtrl.ModelName } not found`); return res.sendStatus(404); }
            // On remplit la requête avec l'item trouvé
            req[PublicationCtrl.ModelName] = result;
            // On continue l'execution
            return next();
        }).catch(next);
    }

    preloadCategory(req, res, next) {
        // On recherche la categorie correspondante
        return PublicationCtrl.Category
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
        return PublicationCtrl.Comment
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
        return PublicationCtrl.Like
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

    findOne(req, res, next) {
        // On execute la requête de sélection et on renvoie le résultat
        return PublicationCtrl.Model
        .findOne({_id: mongoose.Types.ObjectId(req.params[PublicationCtrl.ModelName])})
        .populate(PublicationCtrl.getChildsFromRequest(req))
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ item : ret });
        }).catch(next);
    }

    findAll(req, res, next) {
        // On renvoie le résultat après execution de la requête de sélection
        return PublicationCtrl.Model
        .find(PublicationCtrl.getQueryFromRequest(req), {}, PublicationCtrl.getOptionsFromRequest(req))
        .populate(PublicationCtrl.getChildsFromRequest(req))
        .exec().then(function(items) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut OK et les items trouvés
            return res.status(200).json({ items: items  });
        }).catch(next);
    }

    count(req, res, next) {
        // On compte et on renvoie le résultat du comptage
        return PublicationCtrl.Model
        .count(PublicationCtrl.getQueryFromRequest(req))
        .then(function(result) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut Ok et le résultat du comptage
            return res.status(200).json({ count: result  });
        }).catch(next);
    }

    create(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'item
            var item = new PublicationCtrl.Model(req.body[this.ModelName]);
            // On définit l'auteur
            item.author = user;
            // On crée l'item
            return PublicationCtrl.Model.create(item).then(function(newItem) {
                 // On crée un evenement
                 return PublicationCtrl.Event
                 .newEvent(`${ PublicationCtrl.ModelName }_created`, user, { kind: PublicationCtrl.ModelName, item: newItem })
                 .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    edit(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[PublicationCtrl.ModelName].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On met à jour l'item
            return PublicationCtrl.Model
            .findOneAndUpdate({_id: item._id }, req.body[PublicationCtrl.ModelName])
            .then(function(newItem) {
                // On crée un evenement
                return PublicationCtrl.Event
                .newEvent(`${ PublicationCtrl.ModelName }_updated`, user, { kind: PublicationCtrl.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    publish(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'item préchargé
            var item = req[PublicationCtrl.ModelName];
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return PublicationCtrl.Model
            .findOneAndUpdate({_id: item._id }, {$set: { publishedAt: Date.now() }})
            .then(function(newItem) {
                // On crée un evenement
                return PublicationCtrl.Event
                .newEvent(`${ PublicationCtrl.ModelName }_published`, user, { kind: PublicationCtrl.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    delete(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[PublicationCtrl.ModelName].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'item
            return PublicationCtrl.Model
            .findByIdAndRemove(article._id)
            .then(function(newItem) {
                // On crée un evenement
                return PublicationCtrl.Event
                .newEvent(`${ PublicationCtrl.ModelName }_deleted`, user, { kind: PublicationCtrl.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    comment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du commentaire
            var source = req[PublicationCtrl.ModelName];
            // On crée un commentaire            
            return PublicationCtrl.Comment.create({ 
                body: req.body.comment.body, 
                author: user,
                source: { kind: PublicationCtrl.ModelName, item: source }
             }).then(function(comment) {                
                // On ajoute le commentaire à la source
                return PublicationCtrl.Model
                .findOneAndUpdate({ _id: source._id }, { $push: { comments: comment }, $inc: { nbComments : 1 }})
                .then(function() {
                    // On crée un evenement
                    return PublicationCtrl.Event
                    .newEvent(`${ PublicationCtrl.ModelName }_commented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    uncomment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été trouvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[PublicationCtrl.ModelName];
            // On supprime le commentaire
            return PublicationCtrl.Comment.findByIdAndRemove(req.comment._id).then(function(comment) {
                // On supprime le lien avec la source
                return PublicationCtrl.Model
                .findOneAndUpdate({ _id: source._id }, { $pull: { comments: comment }, $inc: { nbComments : -1 }})
                .then(function() {
                    // On crée un evenement
                    return PublicationCtrl.Event
                    .newEvent(`${ PublicationCtrl.ModelName }_uncommented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    like(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du like
            var source = req[PublicationCtrl.ModelName];
            // On crée un like            
            return PublicationCtrl.Like
            .create({ 
                author: user,
                source: { kind: PublicationCtrl.ModelName, item: source }
             })
             .then(function(like) {                
                // On ajoute le like à la source
                return PublicationCtrl.Model
                .findOneAndUpdate({_id: source._id }, { $push: { likes: like }, $inc: { nbLikes : 1 } })
                .then(function() {
                    // On crée un evenement
                    return PublicationCtrl.Event
                    .newEvent(`${ PublicationCtrl.ModelName }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    unlike(req, res, next) {
        // On recherche l'utilisateur authentifié
        return PublicationCtrl.User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[PublicationCtrl.ModelName];
            // On supprime le like
            return PublicationCtrl.Like
            .findByIdAndRemove(req.like._id)
            .then(function(like) {
                // On supprime le lien avec la source
                return PublicationCtrl.Model.findOneAndUpdate({ _id: source._id }, { $pull: { likes: like }, $inc: { nbLikes : -1 }})
                .then(function() {
                    // On crée un evenement
                    PublicationCtrl.Event
                    .newEvent(`${ PublicationCtrl.ModelName }_unliked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    getRoutes() {
        // On récupère le router
        let router = require('express').Router();

        // On précharge l'article s'il est passé en paramètre
        router.param(`${ PublicationCtrl.ModelName }`, this.preload);
        router.param('comment', this.preloadComment);
        router.param('like', this.preloadLike);
        router.param('category', this.preloadCategory);

        // GET : http://<url-site-web:port>/api/articles/
        // Renvoie la liste des elements après pagination
        router.get('/', auth.optional, this.findAll);

        // GET : http://<url-site-web:port>/api/articles/
        // Renvoie le nombre d'elements
        router.get('/count', auth.optional, this.count);

        // GET : http://<url-site-web:port>/api/articles/:id
        // Renvoie l'article correspondant
        router.get(`/:${ PublicationCtrl.ModelName }`, auth.optional, this.findOne);

        // POST : http://<url-site-web:port>/api/articles/create
        // Crée un article
        router.post('/create', auth.required, this.create);

        // POST : http://<url-site-web:port>/api/articles/edit
        // Met à jour l'article correspondant
        router.post(`/:${ PublicationCtrl.ModelName }/edit`, auth.required, this.edit);

        // POST : http://<url-site-web:port>/api/articles/publish
        // Publie l'article correspondant
        router.post(`/:${ PublicationCtrl.ModelName }/publish`, auth.required, this.publish);

        // POST : http://<url-site-web:port>/api/articles/:article
        // Supprime un article existant
        router.delete(`/:${ PublicationCtrl.ModelName }/delete`, auth.required, this.delete);

        // POST : http://<url-site-web:port>/api/articles/:article/comments
        // Ajout un nouveau commentaire à l'article correspondant
        router.post(`/:${ PublicationCtrl.ModelName }/comment`, auth.required, this.comment);

        // DELETE : http://<url-site-web:port>/api/articles/:article/comments
        // Supprime un commentaire de l'article correspondant
        router.delete(`/:${ PublicationCtrl.ModelName }/:comment`, auth.required, this.uncomment);

        // POST : http://<url-site-web:port>/api/articles/:article/comments
        // Ajout un nouveau like à l'article correspondant
        router.post(`/:${ PublicationCtrl.ModelName }/like`, auth.required, this.like);

        // DELETE : http://<url-site-web:port>/api/articles/:article/comments
        // Supprime un like de l'article correspondant
        router.delete(`/:${ PublicationCtrl.ModelName }/:like`, auth.required, this.unlike);

        // On renvoie le router
        return router;
    }
}

// Définition du controleur de base
module.exports = PublicationCtrl;