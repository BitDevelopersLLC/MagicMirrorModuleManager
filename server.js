var url = require('url');
var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var qrcode = require('qrcode-terminal');
var googl = require('goo.gl');

// NOTE: GitHub Handling Dependencies
var git = require("nodegit");
var gitParse = require("git-url-parse");
var gitCommits = require('git-commits');
var gitLSCommit = require('git-ls-remote');
var gitBusy = true;


// NOTE: For communication between server and client.
var app = require('http').createServer(handler, {ssl: 'true'})
var io = require('socket.io')(app);

// NOTE: For IP Address.
var os = require('os');
var ifaces = os.networkInterfaces();


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
  var content = "var repositories = ";

  try {
    eval(fs.readFileSync('repos.js')+'');
  } catch (err) {
    console.error("[Error] Failed to evaluate the file repos.js. \n   This only fails if repos.js is not a valid JavaScript syntax. \n   To make things work again, try setting var repositories = {}; in repos.js");
    gitBusy = err;
    content = "var repositories = {};";
    writeFileRepo(content);
    return;    
  } 

  var contentDynamic = repositories;


  var parsedRepo = null;
  var parsedDirectory = null;
  var repoPath = null;
  var repoHash = null;

  switch (handleType) {

    case "pull":

      parsedDirectory = (modulesDirectory + "/" + reposit);
      repoPath = path.resolve(parsedDirectory + '/.git');

      rimraf(parsedDirectory, function () {
        console.log("[Info] Module, " + reposit + " has been removed for updating.");
      });

      cloneRepo(repositories[reposit].url, parsedDirectory);

      gitLSCommit.head(reposit, function(err, result) {
        if (err) { 
          console.error("[Error] Retrieval of module's hash failed, so we are unable to retrive the module. \nA module's hash is used for versioning.");
          gitBusy = err;
          throw err;
        } else { 
          repoHash = result;
          contentDynamic[reposit].hash = repoHash;

          if (contentDynamic) {
            content += ("\n" + JSON.stringify(contentDynamic, null, "\t"));
            writeFileRepo(content);
          }
        }
      });

    break;

    case "clone":

      parsedRepo = gitParse(String(reposit));
      parsedDirectory = (modulesDirectory + "/" + parsedRepo.name);
      repoPath = path.resolve(parsedDirectory + '/.git');

      gitBusy = true;
      cloneRepo(reposit, parsedDirectory);

      gitLSCommit.head(reposit, function(err, result) {
        if (err) { 
          console.error("[Error] Retrieval of module's hash failed, so we are unable to retrive the module. \nA module's hash is used for versioning.");
          gitBusy = err;
        throw err;
        } else { 
          repoHash = result;
          contentDynamic[parsedRepo.name] = { url: reposit, hash: repoHash };
          if (contentDynamic != null) {
            content += ("\n" + JSON.stringify(contentDynamic, null, "\t"));
            writeFileRepo(content);
          }
        }
      });
    break;

    default:
      console.error("[Error] Function repoHandle() was called with a invalid handleType = " + handleType);

  }
}

repoHandle('clone', 'https://github.com/EliteByte/MagicMirrorConfigurator');



function cloneRepo(repoURL, repoName) {
  git.Clone(repoURL, repoName).then(function(repository) {
    console.log("[Info] Server successfully cloned the module, " + repoName + " GitHub Repository");
    gitBusy = false;
    return;
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

function writeFileRepo(content) {

    fs.writeFile("repos.js", content, function(err) {
    if (err) {
      console.error("[Error] Saving to repos.js Failed - > ", err);
    } else {
      console.log("[Info] Push to repos.js Succeeded.");
    }
  });
}


// NOTE: Post-Initialization Statements.
// console.log("Type in the link to open Module Manager.\n" +
//   'http://' + getIP() + ':1984' + "\nOr scan the QR code to be redirected.");
// qrcode.generate('http://' + getIP() + ':1984', {small: true});
// console.log("P.S. iOS 11 Camera App now auto detects QR.");

io.on('connection', function (socket) {

  socket.on('configUpdate', function (data) {
    console.log("[Info] [Start] A client has pushed an update to the Config.js file.");
    writeFile(data);
  });

  socket.on('pull', function (data) {
    console.log('[Info] [Start] A client has pushed a gitHubRepo "pull" request.');
    repoHandle(data.type, data.repo);
  });

  socket.on('clone', function (data) {
    console.log('[Info] [Start] A client has pushed a gitHubRepo "clone" request.');
    repoHandle(data.type, data.repo);
  });

  socket.on('gitBusy', function () {
      socket.emit('gitBusyResponse', gitBusy);
  });

});




