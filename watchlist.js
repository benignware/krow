var
  os = require('os'),
  fs = require('fs'),
  path = require('path'), 
  mkdirp = require('mkdirp'),
  // File helpers
  exists = function(file) {
    return fs.existsSync(file);
  },
  createDir = function(dir) {
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir);
    };
  },
  readFile = function(file) {
    var data = fs.readFileSync(file);
    return data && data.toString();
  },
  writeFile = function(file, data, encoding) {
    encoding = encoding || 'utf8';
    unlink(file);
    options = {
      flag: 'w+'
    };
    // Create dir if not exists
    createDir(path.dirname(file));
    // Actually write file
    fs.writeFileSync(file, data, options);
  },
  open = function(file, mode) {
    // Create dir if not exists
    createDir(path.dirname(file));
    // Open and return file reference
    return fs.openSync(file, mode);
  },
  unlink = function(file) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  };
  // Variables
  cwd = process.cwd(),
  home = cwd || os.homedir();
  
  
// Watchlist Class
function Watchlist(file) {
  this.file = file || 'watchlist';
  this.reload();
}

Watchlist.prototype = new Array();

Watchlist.prototype.reload = function() {
  var result = [];
  if (!exists(this.file)) {
    writeFile(this.file, "");
  }
  var data = readFile(this.file);
  if (data) {
    result = data.split(os.EOL).filter (function (v, i, a) { return a.indexOf (v) == i });
    this.splice(0, this.length);
    Watchlist.prototype.push.apply(this, result);
  }
}

Watchlist.prototype.add = function(dir) {
  this.reload();
  if (this.indexOf(dir) === -1) {
    console.log("Watch " + dir);
    this.push(dir);
    writeFile(this.file, this.join(os.EOL));
  } else {
    // Is already being watched
    console.log(dir + " is already being watched");
  }
};

Watchlist.prototype.remove = function(dir) {
  this.reload();
  var index = this.indexOf(dir);
  if (index >= 0) {
    console.log("Unwatch " + dir);
    this.splice(index, 1);
    writeFile(this.file, this.join(os.EOL));
  } else {
    // Not being watched
    console.log(dir + " is not being watched");
  }
};

module.exports = function(file) {
  return new Watchlist(file);
}