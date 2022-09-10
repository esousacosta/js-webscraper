const puppeteer = require('puppeteer');
const kBookTitleXpath = '//*[@id="content"]/div/div[2]/div[2]/div[3]/span';
const kLibraryXpath = '//*[@id="logo"]/a';
const kBookCoverXpath = '//*[@id="image"]/img';
const kAuthorsSelector = '#content > div > div.main-panel > div.painel-lateral > div.author a';
const kBookPriceXpath =  '//*[@id="content"]/div/div[2]/div[2]/div[6]/span[4]';

async function fetchElementInfo(iPage, iElementXpath, iProperty)
{
    const [aElement] = await iPage.$x(iElementXpath);
    const aElementProperty = await aElement.getProperty(iProperty);
    const aElementPropertyText = await aElementProperty.jsonValue();
    return aElementPropertyText;
}

async function fetchParentElementInfo(iPage, iElementSelector)
{
    const aChildrenTextContents = await iPage.evaluate((iElementSelector) => {
        const aFilhos = Array.from(document.querySelectorAll(iElementSelector));
        if (aFilhos.length === 1)
        {
            return aFilhos[0].innerHTML;
        }

        return aFilhos.reduce(function (iPreviousAuthor, iCurrentAuthor)
        {
            return iPreviousAuthor.innerHTML + ", " + iCurrentAuthor.innerHTML;
        });
    }, iElementSelector);
    
    console.log(aChildrenTextContents);

    return aChildrenTextContents;
}

async function scrapeLibrary(iUrl)
{
    const aBrowser = await puppeteer.launch();
    const aPage = await aBrowser.newPage();
    await aPage.goto(iUrl);

    const aResults = await Promise.all(
        [fetchElementInfo(aPage, kBookTitleXpath, 'textContent'),
        fetchElementInfo(aPage, kLibraryXpath, 'title'),
        fetchElementInfo(aPage, kBookPriceXpath, 'textContent'),
        fetchElementInfo(aPage, kBookCoverXpath, 'src'),
        fetchParentElementInfo(aPage, kAuthorsSelector)]);
    
    aResults[0] = aResults[0].replace(/\n|\r|\t/g, "");

    await aBrowser.close();
    
    console.log(aResults);

    return aResults;
}

module.exports = {
    scrapeLibrary
}