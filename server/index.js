const scrapers = require('./scrapers');
const dbManager = require('./db');
const express = require('express');
const app = express();
const port = 3000;

const aBodyParser = require('body-parser');

app.use(aBodyParser.json());
app.use(function(req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get('/libraries', async (req, res) =>
{
    const aBooks = await dbManager.getAllBooksInDb();
    // TODO: GET from DB
    res.send(aBooks);
})

app.post('/libraries', async (req, res) =>
{
    console.log(req.body);
    const aBookData = await scrapers.scrapeLibrary(req.body.aLibraryUrl);
    const aBooks = await dbManager.insertBookInDb(aBookData[0], aBookData[3], aBookData[1], aBookData[2]);
    res.send(aBooks);
})

app.listen(port, () =>
{
    console.log(`Example app listening on port ${port}`)
})