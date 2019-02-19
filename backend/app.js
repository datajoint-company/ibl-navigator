const express = require('express');
const fs = require('fs');
const util = require('util');

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.use('/api/plots/scatter/1', (req, res, next) => {

    const readFile = util.promisify(fs.readFile)

    async function readThis() {
        // let plot;
        try {
            return await readFile('./src/assets/plotData/data_dateTime_weight1.json', 'utf-8');
        } catch(e) {
            console.log('e', e);
        }
    }
    readThis()
    .then((plot)=> {
        res.status(200).send(plot) 
    });
    
});

module.exports = app;