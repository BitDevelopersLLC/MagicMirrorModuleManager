var url = require('url');
var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var qrcode = require('qrcode-terminal');
var googl = require('goo.gl');

// NOTE: GitHub Handling Dependencies
var git = require("nodegit");
var gitParse = require("git-url-parse");
var gitVer = require('git-rev');
var gitBusy = false;


// NOTE: For communication between server and client.
var app = require('http').createServer(handler, {ssl: 'true'})
var io = require('socket.io')(app);

// NOTE: For IP Address.
var os = require('os');
var ifaces = os.networkInterfaces();

var currentdate = new Date();
var datetime = "Time: "
              + currentdate.getHours() + ":"
              + currentdate.getMinutes() + ":"
              + currentdate.getSeconds();


// NOTE: User changeable variables
var port = 1984;
var modulesDirectory = "modules";

// NOTE: Pre-Initialization Statements
app.listen(port);
googl.setKey('AIzaSyBW-vcSOh3izzGSgSxG-_YDOQ_bIyaRYg8');

function handler (request, response) {
  //console.log('request ', request.url);

  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = './index.html';

    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.svg': 'application/image/svg+xml'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT'){
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
                });
              }
              else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
              }
            }
            else {
              response.writeHead(200, { 'Content-Type': contentType });
              response.end(content, 'utf-8');
            }
          });
}

function getIP() {
  var ipAddress = null;

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
        ipAddress = iface.address;
      } else {
        // this interface has only one ipv4 adress
        //console.log(ifname, iface.address);
        ipAddress = iface.address;    
      }
      ++alias;
    });
  });
  return ipAddress;
}


function repoHandle(handleType, reposit) {
  eval(fs.readFileSync('repos.js')+'');

  var contentDynamic = repositories;
  var content = "var repositories = ";

  var parsedRepo = gitParse(String(reposit));
  var parsedDirectory = (modulesDirectory + "/" + parsedRepo.name);

  switch (handleType) {

    case "pull":
      rimraf(parsedDirectory, function () {
        console.log("[Info] Module, " + parsedRepo.name + " has been removed for updating.");
      });
      cloneRepo(reposit, parsedDirectory);
    break;

    case "clone":
      cloneRepo(reposit, parsedDirectory);
      contentDynamic[parsedRepo.name] = reposit;
      if (contentDynamic != null) {
        content = (content + "\n" + JSON.stringify(contentDynamic, null, "\t"));  
        
      }
      
    break;

    default:
      console.error("[Error] Function repoHandle() was called with a invalid handleType = " + handleType);

  }

  fs.writeFile("repos.js", content, function(err) {
    if (err) {
      console.error(datetime + " [Error] Saving to Repos.js Failed - > ", err);
    } else {
      console.log(datetime + "[Info] Push to Repos.js Succeeded.");
    }
  });
}

  gitVer.short(function (str) {
    console.log('short', str)
    // => aefdd94 
  });

function cloneRepo(repoURL, repoName) {
  git.Clone(repoURL, repoName).then(function(repository) {
    console.log("[Info] Server successfully cloned the module, " + repoName + " GitHub Repository");
  });
}


function writeFile(content) {
  fs.writeFile("test.js", content, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });
}


// NOTE: Post-Initialization Statements.
console.log("Type in the link to open Module Manager.\n" +
  'http://' + getIP() + ':1984' + "\nOr scan the QR code to be redirected.");
qrcode.generate('http://' + getIP() + ':1984', {small: true});
console.log("P.S. iOS 11 Camera App now auto detects QR.");

io.on('connection', function (socket) {

  socket.on('configUpdate', function (data) {
    console.log("A client has pushed an update to the Config.js file.");
    writeFile(data);
  });

  socket.on('pull', function (data) {
    console.log('A client has pushed a gitHubRepo "pull" request.');
    repoHandle(data.type, data.repo);
  });

  socket.on('clone', function (data) {
    console.log('A client has pushed a gitHubRepo "clone" request.');
    repoHandle(data.type, data.repo);
  });

  socket.on('gitBusy', function () {
      socket.emit('gitBusyResponse', gitBusy);
  });

});




