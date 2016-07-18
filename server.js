var express = require("express"),
    engines = require("consolidate"),
    app = express(),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 80,
    pg = require('pg'),
    connection;

pg.defaults.ssl = true;
pg.connect('postgres://ogvpktzuzobtng:SlEbh7s8hyXQCAGbrKOlRUooLc@ec2-54-235-255-27.compute-1.amazonaws.com:5432/dcs500m50eojer', function(err, client) {
  if (err) throw err;
  console.log('Connected to postgres! Getting schemas...');
connection = client;
});

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/', function(req, res){
    connection.query('select title, year, imdb from movies', function (error, result) {
        if (error) {
            console.log(error);
            res.send(error);
        } else if (result) {
            var docs = [];
            result.rows.forEach(function (el) {
                docs.push({
                    title: el.title,
                    year: el.year,
                    imdb: el.imdb
                    }
                );
            });
            res.render('movies', {
                movies : docs
            }); 
        } else {
            res.render('movies', {
                movies : null
            });
        }
    });
});
app.get('/addmovie', function(req, res){
    res.render('addmovie', {}); 
});
app.post('/addmovie', function(req, res){
    var title = req.body.title;
    var year = req.body.year;
    var imdb = req.body.imdb;
    connection.query('INSERT INTO movies(title, year, imdb) values ($1, $2, $3)', [title, year, imdb], function(err, result) {
        if (err){
            console.log(err);
            res.send(err);
        } else {
            console.log(result);
            res.redirect('/');
        }
    });
});

app.get('/init', function(req, res){
     sql = `
        DROP TABLE IF EXISTS "Sensors";
        CREATE TABLE "Sensors" (
            "id" int(11) NOT NULL,
            "name" varchar(20) COLLATE utf8_unicode_ci NOT NULL,
            "description" varchar(100) COLLATE utf8_unicode_ci NOT NULL,
            "isTemperature" tinyint(4) DEFAULT NULL,
            "arduinoId" int(11) DEFAULT NULL,
            PRIMARY KEY ("id")
        );
        DROP TABLE IF EXISTS "SensorsHistory";
        CREATE TABLE "SensorsHistory" (
            "sensorId" int(11) NOT NULL,
            "date" datetime NOT NULL,
            "value" decimal(5,2) NOT NULL,
            KEY "sensorId" ("sensorId"),
            CONSTRAINT "SensorsHistory_ibfk_1" FOREIGN KEY ("sensorId") REFERENCES "Sensors" ("id")
        );
        DROP TABLE IF EXISTS "movies";
        Create table movies(title varchar(255), year int, imdb varchar(50))
     `;

     connection.query(sql, function(err, result) {
        if (err){
            console.log(err);
            res.send(err);
        } else {
            console.log(result);
            res.send('init successfull');
        }
    });
});
app.use(function(req, res){
    res.sendStatus(404); 
});
var server = app.listen(port, function(){
    console.log('Express server listening on port %s', port); 
});

