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

function getAggregationJoin(){
    return [
        {   
            $lookup:      
            {        
                from: "categories",
                localField: "favorites",
                foreignField : "_id",
                as: "favorites"
            }
        },
        {   
            $lookup:      
            {        
                from: "articles",
                localField: "_id",
                foreignField : "author",
                as: "articles"
            }
        },
        {   
            $lookup:      
            {        
                from: "comments",
                localField: "_id",
                foreignField : "author",
                as: "comments"
            }
        },
        {   
            $lookup:      
            {        
                from: "likes",
                localField: "_id",
                foreignField : "author",
                as: "likes"
            }
        },
        {   
            $lookup:      
            {        
                from: "propositions",
                localField: "_id",
                foreignField : "author",
                as: "propositions"
            }
        },
        {   
            $lookup:      
            {        
                from: "ratings",
                localField: "_id",
                foreignField : "author",
                as: "ratings"
            }
        },
        {   
            $lookup:      
            {        
                from: "ratings",
                localField: "_id",
                foreignField : "target",
                as: "notes"
            }
        },
        {   
            $lookup:      
            {        
                from: "tasks",
                localField: "_id",
                foreignField : "author",
                as: "tasks"
            }
        },
        {   
            $lookup:      
            {        
                from: "tenders",
                localField: "_id",
                foreignField : "author",
                as: "tenders"
            }
        },
        { 
            $addFields: { 
                displayName: { $concat: ["$lastname", " ", "$firstname" ]},
                nbArticles: { $size: "$articles" }, 
                nbComments: { $size: "$comments" }, 
                nbLikes: { $size: "$likes" },
                nbRatings: { $size: "$ratings" },		
                nbTenders: { $size: "$tenders" }, 
                totalTenderAmount: { $sum: "$tenders.amount"},
                avgTenderAmount: { $avg: "$tenders.amount"},
                maxTenderAmount: { $max: "$tenders.amount"},		
                nbTasks: { $size: "$tasks" },
                totalTaskAmount: { $sum: "$tasks.amount"},
                avgTaskAmount: { $avg: "$tasks.amount"},
                maxTaskAmount: { $max: "$tasks.amount"},
                nbStars: { $avg: "$ratings.value" }
            }
        },
    ];
}

function getAggregationProject(){
    return { $project: { articles:0, comments:0, likes:0, propositions:0, ratings:0, tasks:0, tenders:0 }};
}

function getAggregationQuery(req){
    var query = [];
    
    if(typeof req.query.name !== 'undefined' ) {
        query.push({ $or: [ 
            { lastname : { $regex : '.*' + req.query.name + '.*' }}, 
            { firstname : { $regex : '.*' + req.query.name + '.*' }}
        ]});
    }
    if(typeof req.query.abos !== 'undefined') {
        query.push({ abo: { $in : req.query.abos }});
    }
    if(typeof req.query.categories !== 'undefined') {
        query.push({ favorites: { $in : req.query.categories }});
    }
    if(typeof req.query.startStars !== 'undefined' && typeof req.query.endStars !== 'undefined') {
        query.push({ nbStars: { $gte: Number(req.query.startStars), $lte: Number(req.query.endStars)}});
    }
    if(typeof req.query.localisation !== 'undefined') {
        query.push({ "address.loc" : { 
            $near : { 
                $geometry : { 
                    type : "Point" ,
                    coordinates : [ Number(req.query.localisation.longitude) , Number(req.localisation.latitude) ] 
                } ,
                $maxDistance : Number(req.query.localisation.distance) || 50
            }
        }});
    }
    return query;
}

function getAggregationOptions(req) {
    var opts = [];   

    var sort = { $sort: { createdAt: 1 } };
    if(typeof req.query.sortBy !== 'undefined') { 
        sort.$sort[req.query.sortBy] = req.query.sortDir ==='desc' ? 1 : -1; 
    }
    opts.push(sort);

    if(typeof req.query.size !== 'undefined' && req.query.size >= 1) {
        opts.push({ $limit: Number(req.query.size) });
    }

    if(typeof req.query.page !== 'undefined' && req.query.page >= 1) {
        opts.push({ $skip: Number((req.query.page - 1) * req.query.size) });
    }

    return opts;
}


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

    get(req, res, next) {
        var aggregation = [];
        
        getAggregationJoin().forEach(join => aggregation.push(join));
        aggregation.push({ $addFields: { canEdit: true }});
        aggregation.push({ $match: { _id: mongoose.Types.ObjectId(req.payload.id) }});
        aggregation.push(getAggregationProject());

        return User.aggregate(aggregation).then(users => {
            if(!users) return res.sendStatus(401);
            return res.status(200).json({ user: users[0] });
        }).catch(next);
    }

    findOne(req, res, next) {
        const query = req.payload ? { _id: mongoose.Types.ObjectId(req.payload.id) }: {};
        return User.findOne(query).then(user => {

            var aggregation = [];
            getAggregationJoin().forEach(join => aggregation.push(join));
            aggregation.push({ $match: { _id: mongoose.Types.ObjectId(req.params.user)}});
            if(user) { aggregation.push({ $addFields: { canEdit: { $eq: [ "$_id", user._id ] }}}); }
            aggregation.push(getAggregationProject());

            return User.aggregate(aggregation).then(users => {
                if(!users) return res.sendStatus(404);
                return res.status(200).json({ user: users[0] });
            });
        }).catch(next);
    }

    findAll(req, res, next) {
        const query = req.payload ? { _id: mongoose.Types.ObjectId(req.payload.id) }: {};
        return User.findOne(query).then(user => {

            var aggregation = [];        
            getAggregationJoin().forEach(join => aggregation.push(join));
            if(user) { aggregation.push({ $addFields: { canEdit: { $eq: [ "$_id", user._id ] }}}); }
            aggregation.push(getAggregationProject());

            var query = getAggregationQuery(req);
            if(query && query.length > 0) { 
                var $match = { $and: [] };
                query.forEach(q => $match.$and.push(q));
                aggregation.push($match); 
            }

            getAggregationOptions(req).forEach(o => aggregation.push(o));

            return Promise.all([
                User.aggregate(aggregation).exec(),
                User.count(query && query.length > 0 ? { $and: query } : {}).exec()
            ]).then(function(results){ 
                var users = results[0];
                var nb = results[1];
                return res.status(200).json({ users: results[0], count: results[1] });
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
        router.get('/users', auth.optional,this.findAll);
        router.get('/users/:user', auth.optional,this.findOne);
        router.get('/account', auth.required, this.get);
        router.post('/account', auth.required, this.edit);
        return router;
    }
}

module.exports = new UserCtrl();