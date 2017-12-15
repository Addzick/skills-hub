/*
  Fichier     : controllers/users.js
  Auteur      : Youness FATH
  Date        : 26.10.2017
  Description : Contient les méthodes de gestion des utilisateurs
*/

// Importation des ressources externes
const passport = require('passport');
const mongoose = require('mongoose');
const auth     = require('../config/auth');
const User     = mongoose.model('user');
const Event    = mongoose.model('event');
const Address  = mongoose.model('address');

// Définition du controleur
class UserCtrl {
    constructor() {
    }

    register(req, res, next) {
        // On contrôle la présence d'un email
        if(!req.body.user.username) {
            return res.status(422).json({ errors: { "username": "is required" }});
        }
        // On contrôle la présence d'un email
        if(!req.body.user.email) {
            return res.status(422).json({ errors: { "email": "is required" }});
        }
        // On contrôle la présence du mot de passe
        if(!req.body.user.password) {
            return res.status(422).json({ errors: { "password": "is required" }});
        }
        // On crée un nouvel utilisateur
        var user = new User({
            username: req.body.user.username,
            email: req.body.user.email,
            firstname: req.body.user.firstname,
            lastname: req.body.user.lastname
        });
        // On met à jour le nom d'utilisateur et le mot de passe
        user.setPassword(req.body.user.password);
        // On sauve le nouvel utilisateur
        return user
        .save()
        .then(function() {
            // On crée un evenement
            return Event
            .newEvent('user_registered', user, { kind: 'user', item: user })
            .then(function() {
                return res.status(200).json({ token: user.generateJWT() });
            });
        }).catch(next);
    }

    login(req, res, next) {
        // On contrôle la présence d'un email
        if(!req.body.user.username) {
            return res.status(422).json({ errors: { "username": "is required" }});
        }
        // On contrôle la présence du mot de passe
        if(!req.body.user.password) {
            return res.status(422).json({ errors: { "password": "is required" }});
        }
        // On tente d'authentifier l'utilisateur
        passport.authenticate('local-login', { session: false }, function(err, user, info) {
           // Si une erreur a été rencontrée, on la renvoie
           if(err) { console.error(err); return res.status(422).json(err); }
           // Si aucun utilisateur n'existe, on renvoie une erreur
           if(!user) { console.info(info); return res.status(422).json(info); }
           // On crée un evenement
           return Event
           .newEvent('user_connected', user, { kind: 'user', item: user })
           .then(function() {
               return res.status(200).json({ token: user.generateJWT() });
           }).catch(next);
       })(req, res, next);
    }

    logout(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (user) {
                return Event
                .newEvent('user_disconnected', user, { kind: 'user', item: user })
                .then(function() {
                    return res.status(202);
                });
            }
            return next();
        }).catch(next);
    }

    edit(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findByIdAndUpdate(req.payload.id, { 
            $set: req.body.user
        }, { new: true, upsert: true })
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }
            // On crée un evenement
            return Event
            .newEvent('user_updated', user, { kind: 'user', item: user })
            .then(function() {
                // On renvoie un statut OK avec l'utilisateur et le token
                return res.status(200).json({ 
                    user: user
                });
            });
        }).catch(next);
    }

    editAddress(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Si aucun utilisateur trouvé, on renvoie un statut 401
            if (!user) { return res.sendStatus(401); }            
            // On sauve la nouvelle addresse
            var address = req.body.address;
            return Address
            .findOneAndUpdate({ 
                'loc.coordinates': address.loc.coordinates
            }, address, { new: true, upsert:true })
            .then(function(addr){
                // On contrôle l'adresse
                if(!addr) { return res.sendStatus(422); }
                // On ajoute l'adresse à l'utilisateur
                user.address = addr;
                return user.save().then(function(newUser) {
                    // On crée un evenement
                    return Event
                    .newEvent('user_updated', user, { kind: 'user', item: newUser })
                    .then(function() {
                        // On renvoie un statut OK avec l'utilisateur et le token
                        return res.status(200).json({ 
                            address: addr
                        });
                    });
                });                
            });
            
        }).catch(next);
    }
    
    get(req, res, next) {
        // On recherche l'utilisateur authentifié
        return User
        .findById(req.payload.id)
        .then(function(user) {
            // Aucun utilisateur, on renvoie un statut 401
            if(!user){ return res.sendStatus(401); }
            // On renvoie un statut OK et l'utilisateur correctement rempli
            return res.status(200).json({ user: user.toJSONFor(user) });
        }).catch(next);
    }

    findOne(req, res, next) {
        return Promise.all([
            req.payload ? User.findById(req.payload.id).exec() : User.findOne({}).exec(), 
            User.findOne({ _id: mongoose.Types.ObjectId(req.params.user) }).exec()
        ]).then(function(results) {
            if (!results || results.length < 2) { return res.sendStatus(404); }
            return res.status(200).json({ 
                user: results[1].toJSONFor(results[0])
            });
        }).catch(next);
    }

    findAll(req, res, next) {
        var query = {};
        var opts = { skip: 0, limit: 20, sort: { updatedAt: 'desc' } };
        if(typeof req.query.lastname !== 'undefined' ) {
            query.lastname = { $regex : '.*' + req.query.lastname + '.*' };
        }
        if(typeof req.query.firstname !== 'undefined' ) {
            query.firstname = { $regex : '.*' + req.query.firstname + '.*' };
        }
        if(typeof req.query.abos !== 'undefined') {
            query.abo = { $in : req.query.abos };
        }
        if(typeof req.query.categories !== 'undefined') {
            query.favorites = { $in : req.query.categories };
        }
        if(typeof req.query.startStars !== 'undefined' && typeof req.query.endStars !== 'undefined') {
            query.nbStars = { 
                $gte: new Number(req.query.startStars),
                $lte: new Number(req.query.endStars)
            };
        }
        if(typeof req.query.localisation !== 'undefined') {
            query.address.loc = { 
                loc: { 
                    $near : { 
                        $geometry : { 
                            type : "Point" ,
                            coordinates : [ new Number(req.query.localisation.longitude) , new Number(req.localisation.latitude) ] 
                        } ,
                        $maxDistance : new Number(req.query.localisation.distance) || 50
                    } 
                } 
            }
        }        
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
            User.find(query, {}, opts).exec(),
            User.count(query).exec()
        ]).then(function(results){ 
            var user = results[0];
            var users = results[1];
            var nb = results[2];
            return res.status(200).json({ 
                users: users.map(function(u) {
                    return u.toJSONFor(user);
                }),
                count: nb
            });
        }).catch(next);
    }

    setSocketId(username, socketid) {
        return User
        .findOneAndUpdate(
            { username: username },
            { connection: socketid }
        ).catch(function(err){
            console.error(err);
        });
    }

    unsetSocketId(username) {
        return User
        .findOneAndUpdate(
            { username: username },
            { $set: {connection: '' }},
            { new: true }
        ).catch(function(err) {
            console.error(err);
        });
    }

    getRoutes() {
        var router = require('express').Router();
        router.post('/register', this.register);
        router.post('/login', this.login);
        router.delete('/logout', auth.required, this.logout);
        router.get('/account', auth.required, this.get);
        router.post('/account', auth.required, this.edit);
        router.put('/account', auth.required, this.editAddress);
        router.get('/users', auth.optional,this.findAll);
        router.get('/users/:user', auth.optional,this.findOne);
        return router;
    }
}

module.exports = new UserCtrl();