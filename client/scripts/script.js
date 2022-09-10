function submitLibrary()
{
    const aLibraryUrl = document.querySelector('.library-input').value;
    fetch('http://localhost:3000/libraries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aLibraryUrl })
    })
    // send to server;
}

function createNewElement(iType, iAttrs = {})
{
    const aNewElement = document.createElement(iType);
    for (let aAttr in iAttrs)
    {
        const aValue = iAttrs[aAttr];
        if (aAttr == 'innerText')
        {
            aNewElement.innerText = aValue;
        }
        else
        {
            aNewElement.setAttribute(aAttr, aValue);
        }
    }
    return aNewElement;
}

async function loadLibraries()
{
    const aReply = await fetch('http://localhost:3000/libraries');
    const aBooks = await aReply.json();

    const aDivContainer = document.querySelector('.container');

    aBooks.forEach(aBook =>
    {
        const aNewCard = createNewElement('div', { class: 'card' });
        const aInfoSubCard = createNewElement('div', { class: 'sub-card'});
        const aTitle = createNewElement('div', { class: 'title', innerText: aBook.title });
        const aAuthors = createNewElement('div', { class: 'authors', innerText: aBook.authors });
        const aPrice = createNewElement('div', { class: 'price', innerText: "Preço: R$ " + aBook.price });
        const aImg = createNewElement('img', { src: aBook.imgUrl });
        aImg.style.width = '200px';
        aNewCard.appendChild(aImg);
        aInfoSubCard.appendChild(aTitle);
        aInfoSubCard.appendChild(aAuthors);
        aInfoSubCard.appendChild(aPrice);
        aNewCard.appendChild(aInfoSubCard);
        aDivContainer.appendChild(aNewCard);
    });
}

loadLibraries();