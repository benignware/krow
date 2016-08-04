// ps -e|grep node
var
  os = require('os'),
  http = require('http'),
  chokidar = require('chokidar'),
  fs = require('fs'),
  path = require('path'), 
  mkdirp = require('node-mkdirp'),
  cwd = process.cwd(),
  home = path.join(os.homedir(), '.krow'),
  watchlist = require('./watchlist')(path.join(home, 'watchlist')).observe(),
  observers = {};
  


function Observer(dir) {
  this.dir = dir;
  this.watcher = null;
  this.start();
}

Observer.prototype.start = function() {
  var
    ready = false;
  
  this.watcher = chokidar.watch(this.dir, {ignored: /\.krow\/.*/})
    .on('all', function(event, path) {
      if (ready) {
        emitEvent({type: "file." + event, message: path});
      }
    })
    .on('ready', function() {
      ready = true;
    });
};

Observer.prototype.stop = function() {
  if (this.watcher) {
    // Stop watcher
    console.log("STOP WATCHER");
  }
};

// Observe watchlist
watchlist.forEach(function(dir) {
  observers[dir] = new Observer(dir);
});
  
watchlist.on('add', function(dir) {
  observers[dir] = observers[dir] || new Observer(dir);
  console.log("WATCH DIR HAS BEEN ADDED: ", observers);
});

watchlist.on('remove', function(dir) {
  console.log("WATCH DIR HAS BEEN REMOVED: ", observers);
  if (observers[dir]) {
    observers[dir].stop();
  }
  delete observers[dir];
});

function emitEvent(e) {
  console.log(new Date() + ": " + e.type, e.message);
}


require('./server')(9384).start();
