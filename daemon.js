var
  os = require('os'),
  fs = require('fs'),
  path = require('path'), 
  mkdirp = require('mkdirp'),
  spawn = require('child_process').spawn,
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
    console.log("write file: ", file);
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
  },
  // Variables
  cwd = process.cwd(),
  home = cwd || os.homedir(),
  command = process.argv[2],
  pid, out;

/*
 * Daemon Class
 */  
function Daemon(script, pidFile, logFile) {
  this.script = script || this.script;
  this.pidFile = pidFile || this.pidFile;
  this.logFile = logFile || this.logFile;
}

Daemon.prototype = {
  pidFile: 'pid',
  logFile: 'out.log',
  script: 'service.js',
  isRunning: function() {
    var
      pidFile = this.pidFile,
      pid;
    if (exists(pidFile)) {
      pid = readFile(pidFile);
      if (pid) {
        // Check if a process with this id is actually running, otherwise delete pid file
        try {
          process.kill(pid, 0);
          return true;
        } catch(e) {
          unlink(pidFile);
          return false;
        }
      }
    }
    return false;
  },
  start: function() {
    console.log("start");
    var
      logDir = path.dirname(this.logFile),
      pidFile = this.pidFile,
      out,
      child;
    
    // Open file for logging 
    out = open(this.logFile, 'a');
    
    // Check daemon state and start
    if (this.isRunning()) {
      // Service is already running.
      console.log("Service is already running...");
    } else {
      // Actually start service...
      console.log("Start service...");
      // Spawn the child process
      child = spawn('node', [path.join(__dirname, this.script)], {
        detached: true,
        stdio: ['ignore', out, out],
        env: process.env
      });
      
      // Write pid file
      writeFile(pidFile, child.pid);
      
      // Remove the pid file on close
      child.on('close', function(code) {
        // Child process has been closed
        console.log("Child process has been closed");
        unlink(pidFile);
      });
      
      // On SIGTERM delete the pid file
      function cleanExit() {
        // Parent process is about to exit
        console.log("Service stopped.");
        // Delete pid file
        unlink(pidFile);
        child.exit(-1);
      }
      process.on('SIGINT', cleanExit); // catch ctrl-c
      process.on('SIGTERM', cleanExit); // catch kill
      
      // Unref child process
      child.unref();
      
      // Exit parent process
      process.exit(-1);
    }
    
  },
  stop: function(callback) {
    callback = callback || function() {};
    var
      // Get pid reference
      pidFile = this.pidFile,
      pid;
      
    if (!this.isRunning()) {
      // Service is not running
      console.log('Service is not running');
    } else {
      // Kill process
      pid = readFile(pidFile);
      try {
        process.kill(pid, "SIGTERM");
        callback(false);
        console.log("Service has been stopped");
      } catch(e) {
        console.error('Could not kill process', e);
      }
    };
  },
  restart: function(callback) {
    callback = callback || function() {};
    var
      daemon = this;
    // Stop Daemon
    daemon.stop(function() {
      // Start Daemon
      console.log("stopped");
      daemon.start();
      callback();
    });
  },
  status: function() {
    // Get daemon-pid reference
    if (!this.isRunning()) {
      console.log('Service is NOT running.');
    } else {
      console.log('Service is running.');
    }
  }
};
module.exports = Daemon;