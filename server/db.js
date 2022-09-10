const { connect } = require('puppeteer');
const typeorm = require('typeorm');

class Book {
    constructor(iId, iTitle, iAuthors, iPrice, iImgUrl) {
        this.id = iId;
        this.title = iTitle;
        this.authors = iAuthors;
        this.price = iPrice;
        this.imgUrl = iImgUrl;
    }
}

const EntitySchema = require("typeorm").EntitySchema;

const BookSchema = new EntitySchema(
    {
        name: "Book",
        target: Book,
        columns: {
            id: {
                primary: true,
                type: "int",
                generated: true
            },
            title: {
                type: "varchar",
            },
            authors: {
                type: "text"
            },
            price: {
                type: "text"
            },
            imgUrl: {
                type: "text"
            }
        }
    }
);

async function getConnectionToDb() {
    return await typeorm.createConnection(
        {
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "root",
            database: "libraryscrapers",
            synchronize: true,
            logging: false,
            entities: [
                BookSchema
            ]
        }
    )
}

async function getAllBooksInDb()
{
    const aConnection = await getConnectionToDb();
    const aBookRepo = aConnection.getRepository(Book);
    const aBooks = await aBookRepo.find();
    aConnection.destroy();
    return aBooks;
}

async function insertBookInDb(iTitle, iAuthors, iPrice, iImgUrl)
{
    const aConnection = await getConnectionToDb();

    const aBook = new Book();
    aBook.title = iTitle;
    aBook.authors = iAuthors;
    aBook.price = iPrice;
    aBook.imgUrl = iImgUrl;
    
    const aBookRepo = aConnection.getRepository(Book);
    const aResult = await aBookRepo.save(aBook);
    console.log('saved', aResult);
    
    const aListOfAllBooks = await aBookRepo.find();
    aConnection.destroy();
    return aListOfAllBooks;
}

module.exports = {
    getAllBooksInDb,
    insertBookInDb
}