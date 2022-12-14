const puppeteer = require("puppeteer");
const dbManager = require("./db");
const kBookTitleXpath = '//*[@id="content"]/div/div[2]/div[2]/div[3]/span';
const kLibraryXpath = '//*[@id="logo"]/a';
const kBookCoverXpath = '//*[@id="image"]/img';
const kAuthorsSelector =
  "#content > div > div.main-panel > div.painel-lateral > div.author a";
const kBookPriceXpath = '//*[@id="content"]/div/div[2]/div[2]/div[6]/span[4]';
const kSecondaryBookPriceXpath =
  '//*[@id="content"]/div/div[2]/div[2]/div[6]/span[3]';

const kBsmHomeLink = "https://livrariabsm.com.br/";
const kSensoIncomumHomeLink = "https://livraria.sensoincomum.org/";

async function fetchElementInfo(iPage, iElementXpath, iProperty) {
  const [aElement] = await iPage.$x(iElementXpath);
  const aElementProperty = await aElement.getProperty(iProperty);
  const aElementPropertyText = await aElementProperty.jsonValue();
  return aElementPropertyText;
}

async function fetchChildElementsInfo(iPage, iElementSelector) {
  console.log("Fetching child elements info - author");
  try {
    const aChildrenTextContents = await iPage.evaluate((iElementSelector) => {
      const aFilhos = Array.from(document.querySelectorAll(iElementSelector));

      if (!aFilhos.length) {
        console.log("No authors found!");
        return aFilhos;
      }

      if (aFilhos.length === 1) {
        console.log("Found a single author!");
        return aFilhos[0].innerHTML;
      }

      return aFilhos.reduce(function (iPreviousAuthor, iCurrentAuthor) {
        return iPreviousAuthor.innerHTML + ", " + iCurrentAuthor.innerHTML;
      });
    }, iElementSelector);

    return aChildrenTextContents;
  } catch (e) {
    console.log(`ERROR - Caught exception: ${e}`);
  }
}

async function fetchInfoFromFoundBookPage(iPage, iElementSelector) {
  try {
    const aFoundBookUrl = await iPage.evaluate((iElementSelector) => {
      const aProductsSection = Array.from(
        document.querySelectorAll(iElementSelector)
      );
      if (aProductsSection.length === 0) {
        return [];
      }
      return (aFirstFoundBookUrl =
        aProductsSection[0].querySelector("div > div > a").href);
    }, iElementSelector);

    await iPage.goto(aFoundBookUrl);

    return await scrapeElementsFromPage(iPage);
  } catch (iError) {
    console.log(`ERROR - Couldn't find the requested book: ${iError}`);
    return undefined;
  }
}

async function scrapeElementsFromPage(iPage) {
  try {
    console.log("Beginning the scrapping of elements from the page...");
    const aResults = await Promise.all([
      fetchElementInfo(iPage, kBookTitleXpath, "textContent").catch((e) =>
        console.log(`ERROR - Title not found: ${e}`)
      ),
      fetchElementInfo(iPage, kLibraryXpath, "title").catch((e) =>
        console.log(`ERROR - Library not found: ${e}`)
      ),
      fetchElementInfo(iPage, kBookPriceXpath, "textContent").catch((e) => {
        console.log(`ERROR - Price not found: ${e}`);
        return fetchElementInfo(iPage, kSecondaryBookPriceXpath, "textContent");
      }),
      fetchElementInfo(iPage, kBookCoverXpath, "src").catch((e) =>
        console.log(`ERROR - Book cover not found: ${e}`)
      ),
      fetchChildElementsInfo(iPage, kAuthorsSelector).catch((e) =>
        console.log(`ERROR - Authors not found: ${e}`)
      ),
    ]);

    if (aResults) {
      aResults[0] = aResults[0].replace(/\n|\r|\t/g, "");
      const aBookResult = new dbManager.Book(
        null,
        aResults[0],
        aResults[4],
        aResults[1],
        aResults[2],
        aResults[3]
      );
      return aBookResult;
    } else {
      return undefined;
    }
  } catch (e) {
    console.log(`ERROR - Caught exception: ${e}`);
  }
}

async function scrapeLibrary(iUrl) {
  const aBrowser = await puppeteer.launch();
  const aPage = await aBrowser.newPage();
  await aPage.goto(iUrl);

  const aResults = scrapeElementsFromPage(aPage);

  await aBrowser.close();

  console.log(aResults);

  return aResults;
}

async function performBookMetaSearch(iBookName, iLibraryUrl) {
  const aBrowser = await puppeteer.launch({ headless: true });
  const aPage = await aBrowser.newPage();
  await aPage.goto(iLibraryUrl);
  await aPage.type("#input-search", iBookName);
  try {
    await Promise.all([aPage.waitForNavigation(), aPage.click("#doSearch")]);
  } catch (e) {
    console.log(`Caught navigation-search exception: ${e}`);
    return undefined;
  }

  try {
    const aResults = await fetchInfoFromFoundBookPage(
      aPage,
      "#column-right > div.product-list.extended"
    );
    console.log(
      "Here are the results of the request: ",
      aResults ? aResults : "Nothing found!"
    );

    await aBrowser.close();

    return aResults;
  } catch (iError) {
    console.error(iError);
    return undefined;
  }
}

module.exports = {
  scrapeLibrary,
  performBookMetaSearch,
};
