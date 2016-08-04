var
  os = require('os'),
  fs = require('fs'),
  modelo = require('modelo'),
  path = require('path'), 
  events = require('events'),
  EventEmitter = events.EventEmitter,
  mkdirp = require('mkdirp'),
  chokidar = require('chokidar'),
  file = require('./util/file');
  
// Watchlist Class
function Watchlist(file) {
  this.file = file || 'watchlist';
  this.reload();
}


modelo.inherits(Watchlist, Array, EventEmitter);

Watchlist.prototype.observe = function() {
  var
    file = this.file,
    watchlist = this.reload() && this,
    ready = false;
  
  chokidar.watch(this.file)
    .on('change', function(event, data) {
      // Get the changes
      var cached = watchlist.slice();
      watchlist.reload();
      watchlist.filter(function(dir) {
        return cached.indexOf(dir) === -1;
      }).forEach(function(dir) {
        watchlist.emit('add', dir);
      })
      cached.filter(function(dir) {
        return watchlist.indexOf(dir) === -1
      }).forEach(function(dir) {
        watchlist.emit('remove', dir);
      });
      watchlist.emit('change');
    });
  this.observe = function() {
    console.log("Observation has already been started on this object");
  };
  return this;
}

Watchlist.prototype.reload = function() {
  var result = [];
  if (!file.exists(this.file)) {
    file.writeFile(this.file, "");
  }
  var data = file.readFile(this.file);
  if (data !== null) {
    // Refresh items
    result = data.split(os.EOL).filter (function (v, i, a) { return v && a.indexOf (v) === i});
    this.splice(0, this.length);
    Watchlist.prototype.push.apply(this, result);
  }
  return this;
}

Watchlist.prototype.add = function(dir) {
  this.reload();
  if (!file.exists(dir)) {
    console.log(dir + ' does not exist');
  } else if (this.indexOf(dir) >= 0) {
    console.warn(dir + " is already being watched");
  } else {
    console.log("Watching " + dir, this.file);
    this.push(dir);
    file.writeFile(this.file, this.join(os.EOL));
  }
  return this;
};

Watchlist.prototype.remove = function(dir) {
  this.reload();
  var index = this.indexOf(dir);
  if (index >= 0) {
    console.log("Stop watching " + dir);
    this.splice(index, 1);
    file.writeFile(this.file, this.join(os.EOL));
  } else {
    // Not being watched
    console.log(dir + " is not being watched");
  }
  return this;
};

Watchlist.prototype.removeAll = function() {
  file.writeFile(this.file, "");
  this.reload();
}

module.exports = function(file) {
  return new Watchlist(file);
}