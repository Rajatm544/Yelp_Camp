var express 	= require("express"),
	router 		= express.Router({mergeParams: true	}),
	middleware 	= require("../middleware"),
	Campground 	= require("../models/campground"),
	Comment 	= require("../models/comment");

// NEW - Show the form to add a new comment
router.get("/new", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err) {
			console.log(err);
			res.redirect("/campgrounds/" + req.params.id);
		}
		else {
			res.render("comments/new", {campground: campground});
		}
	});
});

// CREATE - Create a new comment
router.post("/", middleware.isLoggedIn, function(req, res){
	// find campground
	Campground.findById(req.params.id, function(err, campground){
		if(err) {
			res.redirect("/campgrounds/" + campground._id);
		}
		else {
			// create a new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Sorry! Something went wrong");
					console.log(err);
				}
				else{
					// add username and user_id to the new comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					// associate the comment to the campground
					campground.comments.push(comment);
					// save them both
					campground.save();
					// redirect to campground show page
					req.flash("success", "Successfully added your comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});			
		}
	});
});

// EDIT - Show the form to edit a comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			console.log(err);
			res.redirect("back");
		}
		else {
			var campground_id = req.params.id;
			res.render("comments/edit", {comment: foundComment, campground_id: campground_id});
		}
	});
});

// UPDATE - Update the comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	// find and update the comment
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}
		else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY - Delete the comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}
		else {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;