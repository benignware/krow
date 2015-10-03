// ps -e|grep node
var
  os = require('os'),
  http = require('http'),
  chokidar = require('chokidar'),
  fs = require('fs'),
  path = require('path'), 
  mkdirp = require('node-mkdirp'),
  cwd = process.cwd(),
  home = cwd,
  watchlist = require('./watchlist')(path.join(home, '.krow', 'watchlist'));


// Observe watchlist


function update() {
  //console.log("....alive: ", new Date());
}

function start() {
  console.log("Start server");
  try {
    var port = 8004;
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      var content = fs.readFileSync(path.join(DATA_DIR, 'out.log'));
      res.write(content);
      res.end();
    }).listen(port);
  } catch(e) {
    console.log("Error: ", e);
  }
  console.log('Server running at http://127.0.0.1:' + port + '/');
  watch();
  setInterval(function () {  
    update();
  }, 2000);
}

function emitEvent(e) {
  console.log(new Date() + ": " + e.type, e.message);
}

function watch() {
  // One-liner
  var dir = cwd;
  console.log("Watching " + dir + ".");
  var ready = false;
  chokidar.watch(dir, {ignored: /\.krow\/.*/})
    .on('all', function(event, path) {
      if (ready) {
        emitEvent({type: "file." + event, message: path});
      }
    })
    .on('ready', function() {
      ready = true;
    });
}

start();