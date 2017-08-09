var url = require('url');
var fs = require('fs');
var rimraf = require('rimraf-promise');
var path = require('path');
var qrcode = require('qrcode-terminal');

// NOTE: GitHub Handling Dependencies
var git = require("git-clone");
var gitParse = require("git-url-parse");
var gitLast = require('git-last-commit');
var repoCommits = [];
var gitBusy = true;


// NOTE: For communication between server and client.
var app = require('http').createServer(handler, {ssl: 'true'})
var io = require('socket.io')(app);
var serverSocket = null;

// NOTE: For IP Address.
var os = require('os');
var ifaces = os.networkInterfaces();


// NOTE: User changeable variables
var port = 19840;
var modulesDirectory = "modules";
var configPath = "../MagicMirror/config/config.js";
var reposPath = "config/repos.js"


// NOTE: Server variables (Dynamic).
var repositories = null;
var evaled = false;


// NOTE: Pre-Initialization Statements
app.listen(port);

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

function emitMessage(id, data) {
  serverSocket.emit(id, data);
}

function repoHandle(handleType, repo) {
  return new Promise( function (resolve, reject) {

    evalRepos();

    if (evaled) {
      var parsedRepo = null;
      var parsedDirectory = null;
      var repoPath = null;
      var repoHash = null;

      switch (handleType) {

        case "pull":

        break;

        case "clone":
          parsedRepo = gitParse(String(repo));
          parsedDirectory = (modulesDirectory + "/" + parsedRepo.name);

          startCloneRepo(repo, parsedDirectory, parsedRepo.name).then(function (response) {
            resolve(response);
          }, function (error) {
            reject(error);
          });      
        break;

        default:
          var errString = ("Function repoHandle() was called with a invalid handleType = " + handleType);
          reject(errString);
          errorMsg(errString);
      }
    }
  });
}

function startCloneRepo(repoURL, repoPath, repoName) {
  return new Promise(function (resolve, reject) {
      gitBusy = true;
      git(repoURL, repoPath, function (err) {
        if (err) {
          if (err == "Error: 'git clone' failed with status 128") {
            infoMsgAdv("Clone request was denied because module has already been downloaded previously.", "end");
            gitBusy = false;
            resolve(true);
            return true;
          } else {
            var parsedError = ("Server failed to clone the module, " + repoName + " GitHub Repository. Details -> \n" + err);
            errorMsg(parsedError);
            gitBusy = parsedError;
            return false;
          }
        } else {
          infoMsg("Server successfully cloned the module, " + repoName + " GitHub Repository.");
          finishCloneRepo(repoURL, repoPath, repoName).then(function (finishResponse) {
            gitBusy = false;
            resolve(true);
            return true;
          });
        }
      });
  });
}

function finishCloneRepo(repoURL, repoPath, repoName) {
  var contentDynamic = repositories;
  var content = "var reposits = ";

  return new Promise(function (resolve, reject) {
    getLastCommit(repoName).then(function (commitResponse) {
      infoMsg("Server successfully obtained the cloned module's latest hash which will be used for versioning.");
      contentDynamic[repoName] = { url: repoURL, hash: commitResponse.hash };

      if (contentDynamic != null) {
          content += ("\n" + JSON.stringify(contentDynamic, null, "\t"));
          writeFile(content, reposPath).then(function (writeResponse) {
            infoMsg("Server has written info about the, " + repoName + " module, to the repos.js file.");
            resolve(true);
          }, function (error) {
            var parsedError = ("Failed to write the module in repos.js file. Details -> " + error);
            errorMsg(parsedError);
            gitBusy = parsedError;
            reject(parsedError);
          });
        }
    });
  });
}

function getLastCommit(moduleName) {
  return new Promise(function (resolve, reject) {
      gitLast.getLastCommit(function(err, commit) {
        if (err) {
          errorMsg(err); 
          reject(Error(err));
        } else {
          resolve(commit);
        }
      }, {dst: (modulesDirectory + "/" + moduleName)});
  });
}

function writeFile(content, fileName) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(fileName, content, function(err) {
      if (err) {
          reject(Error(err));
      } else {
        resolve(fileName);
      }
    });
  });
}

function configUpdate(data) {
  return new Promise(function (resolve, reject) { 
    var parsedResponse = "";

    writeFile(data, configPath).then(function (response) {
      parsedResponse = ("Update has finished saving client data.");
      infoMsgAdv(parsedResponse, 'end');
      resolve(true);
    }, function (error) {
      parsedResponse = ("Update failed to save client data to " + response);
      errorMsg("An error occured while saving a client update to the file " + response + "\nDetails -> " + error);
      infoMsgAdv(parsedResponse, 'end');
      reject(false);
    });
  });
}

function removeModule(moduleName) {
  var modulePath = (modulesDirectory + "/" + moduleName);
  return new Promise(function (resolve, reject) {
    rimraf(modulePath).then(function () {

      evalRepos();
      var contentDynamic = repositories;
      var content = "var reposits = ";

      if (evaled) {
        delete contentDynamic[moduleName];
        content += ("\n" + JSON.stringify(contentDynamic, null, "\t"));
        writeFile(content, reposPath).then(function (writeResponse) {
            infoMsg("Server has removed info about the, " + moduleName + " module, from the repos.js file.");
            infoMsgAdv("Server has successfully removed the module.", 'end');
            resolve(true);
          }, function (error) {
            var parsedError = ("Failed to write the module in repos.js file. Details -> " + error);
            errorMsg(parsedError);
            gitBusy = parsedError;
            reject(error);
          });
      }
    });
  });
}

function removeModuleConfig(data) {
  return new Promise(function (resolve) {
      var parsedResponse = "";
      writeFile(data, configPath).then(function (response) {
        parsedResponse = ("Successfully removed the module from config.js");
        infoMsgAdv(parsedResponse, 'end');
        resolve(parsedResponse);
      }, function (error) {
        errorMsg("An error occured while removing a module's config from the " + response + " file.\nDetails -> " + error);
        infoMsgAdv('Failed to remove module config', 'end');
        reject(error);
      });
  });
}


// NOTE: Deprecated, needs to be less force-update and more check-update.
function updateModule(moduleName) {
  var modulePath = (modulesDirectory + "/" + moduleName);
  evalRepos();

  return new Promise(function (resolve) {
    rimraf(modulePath).then(function () {
      if (evaled) {
        var moduleURL = repositories.moduleName.url;

        startCloneRepo(moduleURL, modulePath, moduleName).then(function (response) {
          if (response == true) {
            resolve(true);
          } else { 
            reject(response);
          }
        });
      } 
      else {
        reject("Repos.js file couldn't be evaluated. Fix the syntax.");
      }
    });
  });
}

function evalRepos() {
  try {
    eval(fs.readFileSync(reposPath)+'');
    repositories = reposits;
    evaled = true;
  } catch (err) {
    errorMsg("Failed to evaluate the file repos.js. \n   This only fails if repos.js is not in a valid JavaScript syntax. \n   To make things work again, try setting var reposits = {}; in repos.js");
    content = "var reposits = {};";
    writeFile(content, reposPath);
    evaled = false;
  } 
}

function errorMsg(msg) {
  console.error('\x1b[31m', "  [Error]", '\x1b[37m', msg, '\x1b[0m');
}

function infoMsg(msg) {
  console.log('\x1b[36m', "  [Info]", '\x1b[37m' + msg, '\x1b[0m');
}

function infoMsgAdv(msg, opt) {
  if (opt == "start") {
    console.log('\n' + '\x1b[36m' + "[Info]", '\x1b[37m' + '\x1b[32m' + '\x1b[4m' + "[Start]" + '\x1b[0m', '\x1b[37m' + msg, '\x1b[0m');
  } else if (opt == "end") {
    console.log('\x1b[36m' + "[Info]", '\x1b[37m' + '\x1b[31m' + '\x1b[4m' + "[End]" + '\x1b[0m', '\x1b[37m' + msg, '\x1b[0m');
  }
}

// NOTE: Post-Initialization Statements.
console.log("Type in the link to open Module Manager.\n" +
  'http://' + getIP() + ':' + port + "\nOr scan the QR code to be redirected.");
qrcode.generate('http://' + getIP() + ':' + port, {small: true});
console.log("P.S. iOS 11 Camera App now auto detects QR.");

io.on('connection', function (socket) {

  serverSocket = socket;

  socket.on('configUpdate', function (data, fn) {
    infoMsgAdv("A client has pushed an update to the Config.js file.", 'start');
    configUpdate(data).then(function (response) {
        fn(true);
      }, function (error) {
        fn(error);
      });
  });

  socket.on('pull', function (data) {
    infoMsgAdv('A client has pushed a gitHubRepo "pull" request.', 'start');
    repoHandle(data.type, data.repo);
  });

  socket.on('clone', function (data, fn) {
    infoMsgAdv('A client has pushed a gitHubRepo "clone" request.', 'start');
    repoHandle(data.type, data.repo).then(function (response) {
        infoMsgAdv("Server has successfully cloned and setup the module.", 'end');
        fn(true);
      }, function (error) {
        fn(error);
      });
  });

  // NOTE: Deprecated, will be removed soon.
  socket.on('gitBusy', function () {
      socket.emit('gitBusyResponse', gitBusy);
  });

  socket.on('removeModuleConfig', function(data, fn) {
    infoMsgAdv('A client has requested the removal of a module config.', 'start');
    removeModuleConfig(data).then(function (response) {
        fn(true);
      }, function (error) {
        fn(error);
      });
  });

  socket.on('removeModule', function (data, fn) {
    var parsedString = ('A client has requested the deletion of the module, ' + data.moduleName + '.');
    infoMsgAdv(parsedString, 'start');
    removeModule(data.moduleName).then(function (response) {
        fn(true);
      }, function (error) {
        fn(error);
      });
  })

  socket.on('updateModule', function(data, fn) {
    var parsedString = ('A client has requested to update the module, ' + data.module + '.');
    infoMsgAdv(parsedString, 'start');
    updateModule(data.module).then(function (response) {
      infoMsgAdv("Server has successfully updated the module.", 'end');
        fn(true);
      }, function (error) {
        fn(error);
      });
  });

});




