var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express();

//DB Connect string
var connect = "postgres://milind:12345@localhost/database";

//Assign dust engine to .dust files
app.engine('dust', cons.dust);

//set default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//Body parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
    res.render('index');
})

//server
app.listen(3000, function(){
    console.log('Server started On prot 3000');
});