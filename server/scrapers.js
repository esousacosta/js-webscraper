const puppeteer = require('puppeteer');

async function fetchElementInfo(iPage, iElementXpath, iProperty)
{
    const [aElement] = await iPage.$x(iElementXpath);
    const aElementProperty = await aElement.getProperty(iProperty);
    const aElementPropertyText = await aElementProperty.jsonValue();
    return aElementPropertyText;
}

async function fetchParentElementInfo(iPage, iElementXpath, iProperty)
{
    const aChildrenTextContents = await iPage.evaluate(() => {
        const aFilhos = Array.from(document.querySelectorAll('#content > div > div.main-panel > div.painel-lateral > div.author a'));
        if (aFilhos.length === 1)
        {
            return aFilhos[0].innerHTML;
        }

        return aFilhos.reduce(function (iPreviousAuthor, iCurrentAuthor)
        {
            return iPreviousAuthor.innerHTML + ", " + iCurrentAuthor.innerHTML;
        });
    });
    
    console.log(aChildrenTextContents);

    return aChildrenTextContents;
}

async function scrapeLibrary(iUrl)
{
    const aBrowser = await puppeteer.launch();
    const aPage = await aBrowser.newPage();
    await aPage.goto(iUrl);

    const aResults = await Promise.all(
        [fetchElementInfo(aPage, '//*[@id="content"]/div/div[2]/div[2]/div[3]/span', 'textContent'),
        fetchElementInfo(aPage, '//*[@id="content"]/div/div[2]/div[2]/div[6]/span[4]', 'textContent'),
        fetchElementInfo(aPage, '//*[@id="image"]/img', 'src'),
        fetchParentElementInfo(aPage, '//*[@id="content"]/div/div[2]/div[2]/div[2]', 'innerText')]);
    
    aResults[0] = aResults[0].replace(/\n|\r|\t/g, "");

    await aBrowser.close();
    
    console.log(aResults);

    return aResults;
}

module.exports = {
    scrapeLibrary
}