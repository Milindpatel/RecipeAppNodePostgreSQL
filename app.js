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


//*******USE npm install pg@6************** 
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

app.post('/add',function(req,res){
    //PG Connect
    pg.connect(connect, function(err,client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query("INSERT INTO recipe(title,ingredients, directions) VALUES ($1, $2, $3)",
            [req.body.title, req.body.ingredients, req.body.directions]);

            done();
            res.redirect('/')
    });
});

app.delete('/delete/:id', function(req,res){
    //PG connect
    pg.connect(connect, function(err,client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('DELETE FROM recipe WHERE id = $1',[req.params.id]);

        done();
        res.send(200);
            
        
    });
});

app.post('/edit', function(req,res){
    //PG connect
    pg.connect(connect, function(err,client, done){
        if(err){
            return console.error('error fetching client from pool', err);
        }
        client.query('UPDATE recipe SET title=$1, ingredients=$2, directions=$3 WHERE id= $4',[req.body.title, req.body.ingredients ,req.body.directions, req.body.id]);

        done();
        res.redirect('/');
            
        
    });
});
pool.end()

//server
app.listen(3000, function(){
    console.log('Server started On prot 3000');
});