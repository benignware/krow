var
  os = require('os'),
  fs = require('fs'),
  modelo = require('modelo'),
  path = require('path'), 
  events = require('events'),
  EventEmitter = events.EventEmitter,
  mkdirp = require('mkdirp'),
  chokidar = require('chokidar'),
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
    return data !== null ? data.toString() : null;
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
module.exports = {
  exists: exists,
  createDir: createDir,
  readFile: readFile,
  writeFile: writeFile,
  open: open,
  unlink: unlink
};