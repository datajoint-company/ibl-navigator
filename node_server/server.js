const http = require('http');
const app = require('./app');
const port = 3333;

app.set('port', port);
const server = http.createServer(app);

server.listen(port);
console.log('Server listening on port ', port);

// http.createServer(onRequest).listen(3000);
// function onRequest(client_req, client_res) {
//     console.log('serve:', client_req.url)
//     var options = {
//         hostname: '127.0.0.1/',
//         port: 5000,
//         path: 'v0/' + client_req.url,
//         method: client_req.method,
//         headers: client_req.headers
//     };

//     var proxy = http.request(options, function (res) {
//         client_res.writeHead(res.statusCode, res.headers)
//         res.pipe(clientres, {
//             end: true
//         });
//     });

//     client_req.pipe(proxy, {
//         end: true
//     });
// }
