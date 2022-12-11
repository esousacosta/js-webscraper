const { connect } = require("puppeteer");
const typeorm = require("typeorm");

class Book {
  constructor(iId, iTitle, iAuthors, iLibrary, iPrice, iImgUrl) {
    this.id = iId;
    this.title = iTitle;
    this.authors = iAuthors;
    this.library = iLibrary;
    this.price = iPrice;
    this.imgUrl = iImgUrl;
  }
}

const EntitySchema = require("typeorm").EntitySchema;

const BookSchema = new EntitySchema({
  name: "Book",
  target: Book,
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
    },
    authors: {
      type: "text",
    },
    library: {
      type: "text",
    },
    price: {
      type: "text",
    },
    imgUrl: {
      type: "text",
    },
  },
});

async function getConnectionToDb() {
  return await typeorm.createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "libraryscrapers",
    synchronize: true,
    logging: false,
    entities: [BookSchema],
  });
}

async function getAllBooksInDb() {
  const aConnection = await getConnectionToDb();
  const aBookRepo = aConnection.getRepository(Book);
  const aBooks = await aBookRepo.find();
  aConnection.destroy();
  return aBooks;
}

async function insertBookInDb(iTitle, iLibrary, iPrice, iImgUrl, iAuthors) {
  const aConnection = await getConnectionToDb();

  const aBook = new Book();
  aBook.title = iTitle;
  aBook.authors = iAuthors;
  aBook.library = iLibrary;
  aBook.price = iPrice;
  aBook.imgUrl = iImgUrl;

  const aBookRepo = aConnection.getRepository(Book);
  const aResult = await aBookRepo.save(aBook);
  console.log("saved", aResult);

  const aListOfAllBooks = await aBookRepo.find();
  aConnection.destroy();
  return aListOfAllBooks;
}

async function insertBooksInDb(iBooksArray) {
  if (iBooksArray.length === 0) {
    return undefined;
  }

  const aConnection = await getConnectionToDb();
  const aBookRepo = aConnection.getRepository(Book);

  for (anInputBook of iBooksArray) {
    // const aBook = new Book(
    //   null,
    //   anInputBook[0],
    //   anInputBook[4],
    //   anInputBook[1],
    //   anInputBook[2],
    //   anInputBook[3]
    // );

    // const aBookRepo = aConnection.getRepository(Book);
    const aResult = await aBookRepo.save(anInputBook);
    console.log("saved", aResult);
    // aBook.title = iTitle;
    // aBook.authors = iAuthors;
    // aBook.library = iLibrary;
    // aBook.price = iPrice;
    // aBook.imgUrl = iImgUrl;
  }

  const aListOfAllBooks = await aBookRepo.find();
  aConnection.destroy();
  return aListOfAllBooks;
}

module.exports = {
  getAllBooksInDb,
  insertBookInDb,
  insertBooksInDb,
  Book,
};
