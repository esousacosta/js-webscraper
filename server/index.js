const kBsmHomeLink = "https://livrariabsm.com.br/";
const kSensoIncomumHomeLink = "https://livraria.sensoincomum.org/";
const kPhVoxHomeLink = "https://livrariaphvox.com.br/";
const kComunicacaoEPoliticaHomeLink = "https://livrariacep.com.br/";

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
  const aBsmBookData = await scrapers.performBookMetaSearch(
    req.body.aBookName,
    kBsmHomeLink
  );

  const aSensoBookData = await scrapers.performBookMetaSearch(
    req.body.aBookName,
    kSensoIncomumHomeLink
  );

  const aPhVoxBookData = await scrapers.performBookMetaSearch(
    req.body.aBookName,
    kPhVoxHomeLink
  );

  const aCePBookData = await scrapers.performBookMetaSearch(
    req.body.aBookName,
    kComunicacaoEPoliticaHomeLink
  );

  if (!aBsmBookData || !aSensoBookData || !aPhVoxBookData || !aCePBookData) {
    res.send("Couldn't find the book in question: " + req.body.aBookName);
    return;
  }

  const aFoundBooks = [
    aBsmBookData,
    aSensoBookData,
    aPhVoxBookData,
    aCePBookData,
  ];
  let aAddedBooks = await dbManager.insertBooksInDb(aFoundBooks);

  res.send(aAddedBooks);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
