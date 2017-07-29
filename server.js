var url = require('url')
var fs = require('fs')
var path = require('path')

//var localtunnel = require('localtunnel');

var app = require('http').createServer(handler, {ssl: 'true'})
var io = require('socket.io')(app);

var port = 1984;

// function LocalTunnel(port, subdomain) {
//    var  tunnel = localtunnel(port, { subdomain: subdomain}, function (err, tunnel) {
//         if (err) {
//             console.error("localTunnelCode Failed with error: " + inspect(err))
//         } else {
//             console.info("localTunnelCode connected and exposed on : " + tunnel.url + ":" + tunnel._opt.port)
//         }
//     })
//     tunnel.on('close', function () {
// console.error("tunnel -> Tunnel Closed...Going to Restart")
//         tunnel = localtunnel(port, { subdomain: subdomain }, function (err, tunnel) {
//             if (err) {
// console.error("localTunnelCode Restart Failed with error: " + err)
//             } else {
// console.warn("localTunnelCode Re-Connected and exposed on : " + tunnel.url + ":" + tunnel._opt.port)
//             }
//         })
//     })
//
//     tunnel.on('error', function (err) {
// console.error("tunnel Error -> " + err)
//     })
// }
//
//   LocalTunnel(port, 'magicmirror');

  setTimeout(function () { app.listen(port); }, 1);

function handler (request, response) {
  console.log('request ', request.url);

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

function writeFile(content) {
  //var content = ("var config = " + JSON.stringify(config, null, "\t") + ";" + "\n if (typeof module !== 'undefined') {module.exports = config;}");
  fs.writeFile("test.js", content, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });
}


io.on('connection', function (socket) {
  socket.on('configUpdate', function (data, module) {
    console.log("A client has pushed an update to the Config.js file.");
    writeFile(data);
  });
});
