var
  os = require('os'),
  fs = require('fs'),
  path = require('path'),
  http = require('http'),
  home = path.join(os.homedir(), '.krow');

function HTTPServer(port) {
  this.port = port || 9384;
}

function update() {
  //console.log("alive");
}

HTTPServer.prototype.start = function() {
  console.log("Start HTTP Server on port " + this.port);
  try {
    http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      var content = fs.readFileSync(path.join(home, 'debug.log'));
      res.write(content);
      res.end();
    }).listen(this.port);
  } catch(e) {
    console.log("Error: ", e);
  }
  console.log('Server running at http://127.0.0.1:' + this.port + '/');
  setInterval(function () {  
    update();
  }, 2000);
};

module.exports = function() {
  return new HTTPServer(arguments[0]);
};
console.log("require server");
