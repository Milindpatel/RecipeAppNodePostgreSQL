var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    pg = require('pg'),
    app = express();
var pool = new pg.Pool()

//DB Connect string
var connect = "postgres://milind:12345@localhost/recipebookdb";

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
   //PG connect
   pg.connect(connect, function(err,client, done){
       if(err){
           return console.error('error fetching client from pool', err);
       }
       client.query('SELECT * FROM recipe', function(err, result){
           if(err){
               return console.error('error running query', err);
           }
           console.log(result.rows)
           res.render('index', {recipes: result.rows});// it is used for dust files
           done();
       });
   });
});
pool.end()

//server
app.listen(3000, function(){
    console.log('Server started On prot 3000');
});