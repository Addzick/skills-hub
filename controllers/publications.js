/*
  Fichier     : controllers/base.js
  Auteur      : Youness FATH
  Date        : 20.11.2017
  Description : Controleur de base contenant les méthodes de gestion de documents MongoDB
*/

// Importation des ressources externes
import mongoose from 'mongoose';

// Récupération de modeles mongoose
var Comment = mongoose.model('comment');
var Like = mongoose.model('like');
var User = mongoose.model('user');
var Event = mongoose.model('event');

// Définition du controleur de base
export class PublicationCtrl  {
    Model;
    ModelName;

    constructor(model){
        this.Model = model;
        this.ModelName = model.modelName.toLowerCase();
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
        return this.Model
        .findOne({ _id: mongoose.Types.ObjectId(req.params[this.ModelName]) })
        .then(function(result) {
            // Si aucun item trouvé, on renvoie une erreur 404
            if(!result) { console.log(`${ this.ModelName } not found`); return res.sendStatus(404); }
            // On remplit la requête avec l'item trouvé
            req[this.ModelName] = result;
            // On continue l'execution
            return next();
        }).catch(next);
    }

    preloadCategory(req, res, next) {
        // On recherche la categorie correspondante
        Category
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
        Comment
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
        Like
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
        return this.Model
        .findOne({_id: mongoose.Types.ObjectId(req.params[this.ModelName])})
        .populate(this.getChildsFromRequest(req))
        .exec()
        .then(function(item) {
            if (!item) { return res.sendStatus(404); }            
            return res.status(200).json({ item : ret });
        }).catch(next);
    }

    findAll(req, res, next) {
        // On renvoie le résultat après execution de la requête de sélection
        return this.Model
        .find(this.getQueryFromRequest(req), {}, this.getOptionsFromRequest(req))
        .populate(this.getChildsFromRequest(req))
        .exec().then(function(items) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut OK et les items trouvés
            return res.status(200).json({ items: items  });
        }).catch(next);
    }

    count(req, res, next) {
        // On compte et on renvoie le résultat du comptage
        return this.Model
        .count(this.getQueryFromRequest(req))
        .then(function(result) {
            // On contrôle le résultat
            if (!result) { return res.sendStatus(404); }
            // On renvoie un statut Ok et le résultat du comptage
            return res.status(200).json({ count: result  });
        }).catch(next);
    }

    create(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }          
            // On crée l'item
            var item = new this.Model(req.body[this.ModelName]);
            // On définit l'auteur
            item.author = user;
            // On crée l'item
            return this.Model.create(item).then(function(newItem) {
                 // On crée un evenement
                 return Event
                 .newEvent(`${ this.ModelName }_created`, user, { kind: this.ModelName, item: newItem })
                 .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    edit(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[this.ModelName].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }            
            // On met à jour l'item
            return this.Model
            .findOneAndUpdate({_id: item._id }, req.body[this.ModelName])
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ this.ModelName }_updated`, user, { kind: this.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    publish(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On récupére l'item préchargé
            var item = req[this.ModelName];
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req.author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On met à jour l'item            
            return this.Model
            .findOneAndUpdate({_id: item._id }, {$set: { publishedAt: Date.now() }})
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ this.ModelName }_published`, user, { kind: this.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    delete(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {            
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On contrôle que l'utilisateur soit bien l'auteur
            if(req[this.ModelName].author._id.toString() !== user._id.toString()) { return res.sendStatus(403); }
            // On supprime l'item
            return this.Model
            .findByIdAndRemove(article._id)
            .then(function(newItem) {
                // On crée un evenement
                return Event
                .newEvent(`${ this.ModelName }_deleted`, user, { kind: this.ModelName, item: newItem })
                .then(function() {
                    return res.sendStatus(202);
                 });
            });
        }).catch(next);
    }

    comment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du commentaire
            var source = req[this.ModelName];
            // On crée un commentaire            
            return Comment.create({ 
                body: req.body.comment.body, 
                author: user,
                source: { kind: this.ModelName, item: source }
             }).then(function(comment) {                
                // On ajoute le commentaire à la source
                return this.Model
                .findOneAndUpdate({ _id: source._id }, { $push: { comments: comment }, $inc: { nbComments : 1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ this.ModelName }_commented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    uncomment(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été trouvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[this.ModelName];
            // On supprime le commentaire
            return Comment.findByIdAndRemove(req.comment._id).then(function(comment) {
                // On supprime le lien avec la source
                return this.Model
                .findOneAndUpdate({ _id: source._id }, { $pull: { comments: comment }, $inc: { nbComments : -1 }})
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ this.ModelName }_uncommented`, user, { kind: 'comment', item: comment })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    like(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }            
            // On récupére la source du like
            var source = req[this.ModelName];
            // On crée un like            
            return Like
            .create({ 
                author: user,
                source: { kind: this.ModelName, item: source }
             })
             .then(function(like) {                
                // On ajoute le like à la source
                return this.Model
                .findOneAndUpdate({_id: source._id }, { $push: { likes: like }, $inc: { nbLikes : 1 } })
                .then(function() {
                    // On crée un evenement
                    return Event
                    .newEvent(`${ this.ModelName }_liked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }

    unlike(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur n'a été truvé, on renvoie un statut 401
            if(!user) { return res.sendStatus(401); }
            // On récupére la source préchargée
            var source = req[this.ModelName];
            // On supprime le like
            return Like
            .findByIdAndRemove(req.like._id)
            .then(function(like) {
                // On supprime le lien avec la source
                return this.Model.findOneAndUpdate({ _id: source._id }, { $pull: { likes: like }, $inc: { nbLikes : -1 }})
                .then(function() {
                    // On crée un evenement
                    Event
                    .newEvent(`${ this.ModelName }_unliked`, user, { kind: 'like', item: like })
                    .then(function() {
                        return res.sendStatus(202);
                    });
                });
            });
        }).catch(next);
    }
}