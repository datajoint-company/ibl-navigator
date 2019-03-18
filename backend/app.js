const express = require('express');
const fs = require('fs');
const util = require('util');
const bodyParser = require('body-parser');
const request = require('request');

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

// app.use('/api/plots/scatter/:id', (req, res, next) => {

//     async function readThis() {
//         // let plot;
//         try {
//             return await readFile(`./src/assets/plotData/data_dateTime_weight${ req.params.id }.json`, 'utf-8');
//         } catch(e) {
//             console.log('e', e);
//         }
//     }
//     readThis()
//     .then((plot)=> {
//         setTimeout(() => {
//             res.status(200).send(plot);
//         }, 5000);
         
//     });
    
// });

module.exports = app;