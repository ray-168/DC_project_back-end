const express = require('express');
const router = express.Router();
// const bodyParser = require('body-parser');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// const urlencodedParser = bodyParser.urlencoded({ extended: false })

module.exports = router;
