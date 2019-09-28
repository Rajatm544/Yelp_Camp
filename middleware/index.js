// all the middleware goes here
var middlewareObj = {},
	Campground 	  = require("../models/campground"),
	Comment 	  = require("../models/comment");

// middleware to check if campground belongs to a particular user
middlewareObj.checkCampgroundOwnership = function(req, res, next){
	// check if user logged in
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
				req.flash("error", "Campground not found!");
				res.redirect("back");
			}
			else {
				// check if current user created the campground
				if(foundCampground.user.id.equals(req.user._id)){ 
					// foundCampground.user._id is an object and hence '===' wont work	
					return next();
				}
				else {
					req.flash("error", "You don't have the permission to do that");
					res.redirect("back");
				}
			}	
		});
	}
	else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

// middleware to check if the comment belongs to a particular comment
middlewareObj.checkCommentOwnership = function(req, res, next){
	// check if user is logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				req.flash("error", "Comment not found");
				res.redirect("back");
			}
			else {
				// check if currently logged-in user made the comment
				if(foundComment.author.id.equals(req.user._id)) {
					return next();
				}
				else {
					req.flash("error", "You do not have the permission to do that");
					res.redirect("back");
				}
			}
		});
	}
	else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

// middleware to check for logged in user 
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in to do that");
	res.redirect("/login");
}

module.exports = middlewareObj;