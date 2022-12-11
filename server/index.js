const scrapers = require("./scrapers");
const dbManager = require("./db");
const express = require("express");
const app = express();
const port = 3000;

const aBodyParser = require("body-parser");

app.use(aBodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/libraries", async (req, res) => {
  const aBooks = await dbManager.getAllBooksInDb();
  // TODO: GET from DB
  res.send(aBooks);
});

app.post("/libraries", async (req, res) => {
  console.log(req.body);
  const aBookData = await scrapers.scrapeLibrary(req.body.aLibraryUrl);
  const aBooks = await dbManager.insertBookInDb(
    aBookData[0],
    aBookData[1],
    aBookData[2],
    aBookData[3],
    aBookData[4]
  );
  res.send(aBooks);
});

app.post("/metasearch", async (req, res) => {
  console.log(req.body);
  const aBsmBookData = await scrapers.performBookMetaSearchOnBsm(
    req.body.aBookName
  );
  const aSensoBookData = await scrapers.performBookMetaSearchOnSenso(
    req.body.aBookName
  );

  if (!aBsmBookData || !aSensoBookData) {
    res.send("Couldn't find the book in question: " + req.body.aBookName);
    return;
  }

  console.log(`Senso's data: ${aSensoBookData}`);
  console.log(`BSM's data: ${aBsmBookData}`);

  const aFoundBooks = [aBsmBookData, aSensoBookData];
  let aAddedBooks = await dbManager.insertBooksInDb(aFoundBooks);

  //   let aBooks = await dbManager.insertBookInDb(
  //     aBsmBookData[0],
  //     aBsmBookData[1],
  //     aBsmBookData[2],
  //     aBsmBookData[3],
  //     aBsmBookData[4]
  //   );

  //   aBooks = await dbManager.insertBookInDb(
  //     aSensoBookData[0],
  //     aSensoBookData[1],
  //     aSensoBookData[2],
  //     aSensoBookData[3],
  //     aSensoBookData[4]
  //   );
  res.send(aAddedBooks);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
