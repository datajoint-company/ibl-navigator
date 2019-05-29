const express = require('express');
const fs = require('fs');
const util = require('util');
const bodyParser = require('body-parser');
const request = require('request');
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/check-auth');

const app = express();
app.use(bodyParser.json());

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
// const readImage = util.promisify(fs.createReadStream)

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})





// ======================== for testing/developing purpose - keep till raster plots are done ========================== //
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

// =============================== login logic ================================= //
app.post('/login', (req, res) => {
    console.log('logging in user: ', req.body.username);
    if (req.body.username === 'ibluser' && req.body.password === '111111') {
        const token = jwt.sign({username: req.body.username},
                                'some-secret-value-needs-to-be-changed',
                                { expiresIn: "24h"});
        res.status(200).send({ message: 'successful login', token: token, expiresIn: 24 * 60 * 60 * 1000}); //return in millisec
    } else {
        res.status(401).send({message : 'failed login'})
    }
    
});

// ======================== getting info from flask server ========================== //
app.get('/api/sessions', checkAuth, (req, res) => {
    console.log('req.headers is', req.headers)
    // setup for proxy server
    var options = {
        // hostname: '127.0.0.1/',
        port: 5000,
        path: 'v0/_q/sessionpage/?__order=session_start_time', //'v0/session',
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

app.post('/api/sessions', checkAuth, (req, res) => {
    console.log('posting to filter session page');
    
    request.post('http://localhost:5000/v0/_q/sessionpage', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        // console.log(body);
        res.send(body);
    })
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
    // console.log('body is: ', typeof req.body)
    var requestBody = JSON.stringify(req.body)
    console.log('requestBody is...');
    console.log(requestBody);
    console.log('req.body is...');
    console.log(req.body);
    // console.log('request body after stringify: ', typeof requestBody)
    // request.post('https://not-even-a-test.firebaseio.com/test3.json', { form: requestBody }, function (error, httpResponse, body) {
    //     if (error) {
    //         console.error('error: ', error);
    //     }
    //     console.log('response body is');
    //     console.log(body)
    // });
    request.post('http://localhost:5000/v0/_q/subjpage', {form: req.body}, function(error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        console.log('response body is');
        console.log(body)
        res.send(body);
    })
})


app.post('/api/summary', checkAuth, (req, res) => {

    request.post('http://localhost:5000/v0/_q/dailysummary', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        // console.log(body);
        res.send(body);
    })
})

app.post('/api/plot/session-psych-plotData', (req, res) => {
    request.post('http://localhost:5000/v0/sessionpsych', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/session-RTC-plotData', (req, res) => {
    request.post('http://localhost:5000/v0/sessionRTC', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/session-RTTN-plotData', (req, res) => {
    request.post('http://localhost:5000/v0/sessionRTTN', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/waterWeightPlot', (req, res) => {
    request.post('http://localhost:5000/v0/waterweight', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/trialCountsSessionDurationPlot', (req, res) => {
    request.post('http://localhost:5000/v0/TCsessionduration', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        // let info = JSON.parse(body)
        res.send(body);
    })
})

app.post('/api/plot/performanceReactionTimePlot', (req, res) => {
    request.post('http://localhost:5000/v0/performanceRT', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/contrastHeatmapPlot', (req, res) => {
    request.post('http://localhost:5000/v0/contrastheatmap', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/fitParametersPlot', (req, res) => {
    request.post('http://localhost:5000/v0/fitpars', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/datePsychCurvePlot', (req, res) => {
    request.post('http://localhost:5000/v0/datepsych', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/dateReactionTimeContrastPlot', (req, res) => {
    request.post('http://localhost:5000/v0/dateRTcontrast', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
})

app.post('/api/plot/dateReactionTimeTrialNumberPlot', (req, res) => {
    request.post('http://localhost:5000/v0/dateRTtrial', { form: req.body }, function (error, httpResponse, body) {
        if (error) {
            console.error('error: ', error);
        }
        res.send(body);
    })
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