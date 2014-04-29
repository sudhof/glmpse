



/* GET home page. */
/* nothing here */
exports.index = function(req, res){
  res.render('index', {});
};



/* Prompt user to record a glimpse
 */
exports.prompt_glimpse = function(req, res) {
  res.render('prompt_glimpse', {});    
}

/* Display recorded glimpses
 * for a thread
 */
exports.view_glimpse = function(req, res) {
    res.render('view_glimpse', {});
}




