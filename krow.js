#!/usr/bin/env node

var
  os = require('os'),
  fs = require('fs'),
  path = require('path'); 
  // 
  cwd = process.cwd(),
  home = os.homedir(),
  dir = path.join(cwd, '.krow'),
  command = process.argv[2],
  daemon = new (require('./daemon.js'))(
    // Script
    'watch.js',
    // PidFile
    path.join(dir, 'pid'),
    // Logfile
    path.join(dir, 'out.log')
  ),
  watchlist = require('./watchlist')(path.join(home, '.krow', 'watchlist'));
  
switch (command) {
  case 'start':
      // start the server
      daemon.start();
      break;

  case 'stop':
      // stop the server
      daemon.stop();
      break;

  case 'status':
      // print-out server status
      daemon.status();
      break;
      
  case 'restart':
      // print-out server status
      daemon.restart();
      break;
  case 'watch':
      // print-out server status
      watchlist.add(process.cwd());
      break;
  case 'unwatch':
      // print-out server status
      watchlist.remove(process.cwd());
      break;

  default:
      console.error('Usage: krow [start] [stop] [status]');
}