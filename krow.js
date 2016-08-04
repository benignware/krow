#!/usr/bin/env node

var
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  minimist = require('minimist'),
  
  // 
  cwd = process.cwd(),
  home = path.join(os.homedir(), '.krow'),
  //command = process.argv[2],
  argv = minimist(process.argv.slice(2)),
  commands = argv['_'],
  command = argv['_'][0],
  options = argv,
  daemon = new (require('./daemon.js'))(
    // Script
    'watch.js',
    // PidFile
    path.join(home, 'pid'),
    // Logfile
    path.join(home, 'out.log')
  ),
  watchlist = require('./watchlist')(path.join(home, 'watchlist'));

console.log("run krow with command: ", command, " options: ", argv);

switch (command) {
  case 'start':
      // start the server
      daemon.logFile = typeof options.d === 'string'  ? options.d : options.d ? path.join(home, 'debug.log') : null;
      console.log("daemon.logFile: ", daemon.logFile); 
      daemon.start();
      break;

  case 'stop':
      // Stop daemon
      daemon.stop();
      break;

  case 'status':
      // Print-out daemon status
      daemon.status();
      break;
      
  case 'restart':
      // Restart daemon
      daemon.restart();
      break;
  case 'watch':
      // Add directory to watchlist
      watchlist.add(commands[1] && path.resolve(process.cwd(), commands[1]) || process.cwd());
      break;
  case 'unwatch':
      // Remove directory from watchlist
      if (options.a) {
        watchlist.removeAll();
      } else {
        watchlist.remove(commands[1] && path.resolve(process.cwd(), commands[1]) || process.cwd());
      }
      break;
  case 'list':
      // Log watched directories
      if (watchlist.length) {
        console.log("Currently watched directories:", watchlist.join(', '));
        console.log(watchlist.join(os.EOL));
      } else {
        console.log("Watchlist is empty");
      }
      break;

  default:
      console.log('Usage: krow [start] [stop] [status] [list]');
}