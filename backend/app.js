const express = require('express');
const fs = require('fs');
const util = require('util');
const bodyParser = require('body-parser');
const request = require('request');
const http = require('http');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
// const readImage = util.promisify(fs.createReadStream)

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})






app.post('/api/plot', (req, res) =>{
    console.log(req.body);
    if (req.body.type == 'raster_test_data') {
        // res.sendFile(`./src/assets/plotData/${req.body.type}${req.body.id}.png`)
        // const options = {
        //     root: './src/assets/plotData/',
        //     headers: {
        //         'content-type': 'image/png',
        //         'status': 200
        //     }
        // }
        // res.sendFile(`${req.body.type}${req.body.id}.png`, options, function(err) {
        //     if (err) {
        //         throw err;
        //     } else {
        //         console.log(`${req.body.type}${req.body.id}.png`, ' was sent!');
        //     }
        // } )
        
        async function getRasterPlot() {
            try {
                console.log('fetching raster plot');
                return await readFile(`./src/assets/plotData/${req.body.type}${req.body.id}.png`, 'base64');
            } catch (e) {
                console.log('e', e);
                errorInfo = {
                    error: e,
                    message: 'something happened in the retrieval of the plot data'
                }
                throw errorInfo
            }
        }
        // async function decodeRasterPlot(base64str, file) {
        //     try {
        //         var bitmap = new Buffer(base64str, 'base64');
        //         console.log('decoding raster plot');
        //         return await writeFile(file, bitmap);
        //     } catch (e) {
        //         console.log('e', e);
        //         errorInfo = {
        //             error: e,
        //             message: 'something happened in the decoding of the plot data'
        //         }
        //         throw errorInfo
        //     }
        // }
        getRasterPlot()
            .then((rasterplot)=>{
                    // console.log('raster plot fetched. see below')
                    // console.log(rasterplot)
                    res.writeHead(200, { 'Content-Type': 'image/png' })
                    res.end(rasterplot);
            })
            .catch((errorInfo) => {
                console.log("error caught ")
                console.error(errorInfo);
                res.status(500).send(errorInfo);
            });


    } else {
        async function getPlot() {
            try {
                console.log('fetching plot...');
                return await readFile(`./src/assets/plotData/${req.body.type}${req.body.id}.json`, 'utf-8');
            } catch (e) {
                console.log('e', e);
                errorInfo = {
                    error: e,
                    message: 'something happened in the retrieval of the plot data'
                }
                throw errorInfo
            }
        }

        getPlot()
            .then((plot) => {
                console.log('plot fetched. see below')
                console.log(plot)
                // plot.toString('base64')
                setTimeout(() => {
                    res.status(200).send(plot);
                }, 10);

            })
            .catch((errorInfo) => {
                console.log("error caught")
                console.error(errorInfo);

                res.status(500).send(errorInfo);
            });
    }
})

app.get('/api/plots/:type/:id', (req, res, next) => {

    async function readThis() {
        // let plot;
        try {
            return await readFile(`./src/assets/plotData/${ req.params.type }${ req.params.id }.png`);
        } catch(e) {
            console.log('e', e);
        }
    }
    readThis()
    .then((plot)=> {
        setTimeout(() => {
            res.status(200).contentType('image/png').send(plot);
        }, 10);
    });
});

app.get('/api/sessions', (req, res) => {
    console.log('req.headers is', req.headers)
    // setup for proxy server
    var options = {
        // hostname: '127.0.0.1/',
        port: 5000,
        path: 'v0/_q/sessionpage', //'v0/session',
        method: req.method,
        headers: req.headers
    };

    var proxy = http.request(options, function (proxy_res) {
        res.writeHead(proxy_res.statusCode, proxy_res.headers)
        proxy_res.pipe(res, {
            end: true
        });
    });

    req.pipe(proxy, {
        end: true
    });
})

app.post('/api/sessions', (req, res) => {
    console.log('posting to filter session page');
    
    var requestBody = JSON.stringify(req.body)
    console.log('request body after stringify: ', typeof requestBody)
    request.post('http://localhost:5000/v0/_q/sessionpage', { form: requestBody }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
    })

    // setup for proxy server before using request module
    // let sessionPath = 'v0/session/?'
    // let query =''
    // let count = 0
    // console.log('filter in filterValues are: ')
    // for (filter in req.body) {
    //     console.log(filter, ": ", req.body[filter])
    //     if (count == 0) {
    //         query = query + filter + '=' + req.body[filter]
    //     } else {
    //         query = query + '&' + filter + '=' + req.body[filter]
    //     }
    //     count += 1;
    // }
    // console.log('query path is:')
    // console.log(sessionPath + query)

    // var options = {
    //     // hostname: '127.0.0.1/',
    //     port: 5000,
    //     path: sessionPath + query,
    //     method: 'GET',
    //     // method: req.method,
    //     headers: req.headers
    // };

    // var proxy = http.request(options, function (proxy_res) {
    //     res.writeHead(proxy_res.statusCode, proxy_res.headers)
    //     proxy_res.pipe(res, {
    //         end: true
    //     });
    // });

    // req.pipe(proxy, {
    //     end: true
    // });
})



app.get('/api/mice', (req, res) => {
    // setup for proxy server
    var options = {
        // hostname: '127.0.0.1/',
        port: 5000,
        path: 'v0/_q/subjpage',//'v0/subject',
        method: req.method,
        headers: req.headers
    };

    var proxy = http.request(options, function (proxy_res) {
        res.writeHead(proxy_res.statusCode, proxy_res.headers)
        proxy_res.pipe(res, {
            end: true
        });
    });

    req.pipe(proxy, {
        end: true
    });
})

app.post('/api/mice', (req, res) => {
    console.log('req.headers is', req.headers)
    // console.log(req.body);
    let sessionPath = 'v0/subject/?'
    let query = ''
    let count = 0
    console.log('filter in filterValues are: ')
    for (filter in req.body) {
        console.log(filter, ": ", req.body[filter])
        if (count == 0) {
            query += filter + '=' + req.body[filter]
        } else {
            query += '&' + filter + '=' + req.body[filter]
        }
        count += 1;
    }
    //// setup for proxy server
    console.log('inside post mice');
    console.log('body is: ', typeof req.body)
    var requestBody = JSON.stringify(req.body)
    console.log('request body after stringify: ', typeof requestBody)
    request.post('http://localhost:5000/v0/_q/subjpage', {form: requestBody}, function(error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
    })

    // var options = {
    //     // hostname: '127.0.0.1/',
    //     port: 5000,
    //     path: 'https://not-even-a-test.firebaseio.com/test2.json', //'v0/subject',
    //     method: req.method,
    //     body: requestBody,
    //     headers: req.headers
    // };
    
    // var options0 = {
    //     // hostname: '127.0.0.1/',
    //     port: 5000,
    //     path: sessionPath + query,
    //     method: 'GET',
    //     // method: req.method,
    //     // body: req.body,
    //     headers: req.headers
    // };

    // var proxy = http.request(options, function (proxy_res) {
    //     res.writeHead(proxy_res.statusCode, proxy_res.headers)
    //     console.log('what is inside proxy_res?');
    //     console.log(proxy_res);
    //     proxy_res.pipe(res, {
    //         end: true
    //     });
    // });
    
    // // proxy.write(requestBody);
    // req.pipe(proxy, {
    //     end: true
    // });
})

app.post('/api/plot/mouse-weight-plotData', (req, res) => {
    let sessionPath = 'v0/weighing?'
    let query = ''
    let count = 0
    console.log('filter in filterValues are: ')
    for (filter in req.body) {
        console.log(filter, ": ", req.body[filter])
        if (count == 0) {
            query = query + filter + '=' + req.body[filter]
        } else {
            query = query + '&' + filter + '=' + req.body[filter]
        }
        count += 1;
    }
    console.log('query path is:')
    console.log(sessionPath + query)
    // setup for proxy server
    var options = {
        // hostname: '127.0.0.1/',
        port: 5000,
        path: sessionPath + query,
        method: 'GET',
        // method: req.method,
        // body: req.body,
        headers: req.headers
    };

    var proxy = http.request(options, function (proxy_res) {
        res.writeHead(proxy_res.statusCode, proxy_res.headers)
        proxy_res.pipe(res, {
            end: true
        });
    });

    req.pipe(proxy, {
        end: true
    });
})

app.post('/api/plot/mouse-waterIntake-plotData', (req, res) => {
    let sessionPath = 'v0/wateradmin?'
    let query = ''
    let count = 0
    console.log('filter in filterValues are: ')
    for (filter in req.body) {
        console.log(filter, ": ", req.body[filter])
        if (count == 0) {
            query = query + filter + '=' + req.body[filter]
        } else {
            query = query + '&' + filter + '=' + req.body[filter]
        }
        count += 1;
    }
    console.log('query path is:')
    console.log(sessionPath + query)
    // setup for proxy server
    var options = {
        port: 5000,
        path: sessionPath + query,
        method: 'GET',
        headers: req.headers
    };

    var proxy = http.request(options, function (proxy_res) {
        res.writeHead(proxy_res.statusCode, proxy_res.headers)
        proxy_res.pipe(res, {
            end: true
        });
    });
    
    req.pipe(proxy, {
        end: true
    });
})

app.get('/api/plots/testPlot', (req, res, next) => {

    async function readThis() {
        // let plot;
        try {
            // return await readFile(`./src/assets/plotData/data_dateTime_weight${ req.params.id }.json`, 'utf-8');
            return await readFile(`./src/assets/plotData/psych_results_sized.json`, 'utf-8');
        } catch(e) {
            console.log('e', e);
        }
    }
    readThis()
    .then((plot)=> {
        setTimeout(() => {
            res.status(200).send(plot);
        }, 10);
         
    });
    
});

// ============================================================= //


module.exports = app;