var express = require('express');
var path = require('path');
var stylus = require('stylus');
var morgan = require('morgan');
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var app = express();

var compileStylus = function(str,  path){
	return stylus(str).set('filename', path);
};

var logDirectory = __dirname + '/log';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

morgan.token('id', function getId(req) {
  return req.id
});

var assignId = function (req, res, next) {
  req.id = uuid.v4();
  next();
};

app.use(assignId);

app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');

app.use(express.static(__dirname + 'public'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(stylus.middleware(
	{
		src: __dirname + 'public',
		compile: compileStylus
	}
));

app.use(morgan(':id :date[web]   :method   :url    :response-time'));
app.use(morgan(':id :date[web]   :method   :url    :response-time', {stream: accessLogStream}));

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


//Database configura tion

mongoose.connect('mongodb://127.0.0.1/grills');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
  console.log('grills db opened');
});

var messageSchema = mongoose.Schema({message: String});
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;
Message.findOne().exec(function(err, messageDoc) {
  mongoMessage = messageDoc.message;
});

app.get('/partials/:partial_path', function(req, res){
  console.log(req.params.partial_path);
  res.render('partials/' + req.params.partial_path);
});


app.get('/', function(req, res){
	res.render('index', {
    mongoMessage: mongoMessage
  });
});

var port = 3000;
app.listen(port);

console.log('Server listening to the port: ' + port);