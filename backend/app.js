const express = require('express');
const fs = require('fs');
const util = require('util');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const readFile = util.promisify(fs.readFile)

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.post('/api/plot', (req, res) =>{
    console.log(req.body);

    async function getPlot() {
        try {
            return await readFile(`./src/assets/plotData/${ req.body.type }${ req.body.id }.json`, 'utf-8');
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
            setTimeout(() => {
                res.status(200).send(plot);
            }, 5000);

        })
        .catch((errorInfo) => {
            console.log("error caught")
            console.error(errorInfo);
            
            res.status(500).send(errorInfo);
        });
})

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