const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');


// Create before 4-30 edits
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else {
    try {    
      const bookIsbn = book.ISBN
      if (!bookIsbn){
        //  console.log("book ISBN doesn't exist ", bookIsbn)
         res.status(400).send('ISBN does not exist');
        
      } else {
        const checkIsbn = await bookDAO.checkIsbn(bookIsbn)
        // console.log("result of check isbn function ", checkIsbn)
        if (checkIsbn == 1) { //if an isbn exists: skip
          // console.log("skip: book already in database")
          res.status(400).send('book already in database'); 
        } else { //if an isbn does not exist: create book
          // console.log("create book")
         const savedBook = await bookDAO.create(book);
         return res.json(savedBook); 
        }
      }
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});


// Read - single book
router.get("/:id", async (req, res, next) => {
  // console.log("single book id parameters ", req.params)
  // console.log("single book body ", req.body)
  // console.log("single book query", req.query)
  bookIdForAuthor = req.params.id
  // console.log("single book id to get by author", bookIdForAuthor)
  const searchQuery = req.query.query
  //search for matching books
  if (searchQuery) {
    // console.log("search query is present: ", searchQuery)
    const searchResults = await bookDAO.getSearchResults(searchQuery);
    // console.log ("book results are ", searchResults)
    return res.json(searchResults)
  } else {
    // console.log("search query is not present")
  }
  //search for author based on book id
  if (bookIdForAuthor){
    // console.log("book author id is present")
    // const authorDetails  = await bookDAO.getAuthorDetails(bookIdForAuthor);
    // console.log("author details  are ", authorDetails)
    // return res.json(authorDetails)
  } else {
    console.log("book author id is not present")
  }



  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

//Author stats function

router.get("/authors/stats", async (req, res, next) => {
  // console.log("Author stats function")
  // console.log("author info", req.query.authorInfo)
  const authorInfoTrue = req.query.authorInfo
  // console.log("authorInfoTrue variable", authorInfoTrue)
  if (authorInfoTrue){
    const getAuthorStatsInfoTrue = await bookDAO.getAuthorStatsInfoTrue();
    return res.json(getAuthorStatsInfoTrue)
  } else {
    const getAuthorStats = await bookDAO.getAuthorStats();
    // console.log("get author stats (auth info not true ", getAuthorStats)
    return res.json(getAuthorStats)
  }
});



// Read - get all books and get books with certain author ids
router.get("/", async (req, res, next) => {
  // console.log("all books params", req.params)
  // console.log("all books body ", req.body)
  // console.log("all books query", req.query)
  let { page, perPage } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  // console.log("page is ", page, " per page is ", perPage)
  if (!req.query.authorId) { //check to see if an author id is present
    // console.log("no: request doesn't have an author id")
  } else {
    // console.log("yes: request does have an author id")
    const authorIdReq = req.query.authorId
    // console.log("routes query ", req.query)
    // console.log("author id request is", authorIdReq)
    const getAuthorBooks = await bookDAO.getByAuthorId(authorIdReq);
    // console.log ("returned author books are ", getAuthorBooks)
    return res.json(getAuthorBooks)
  }
  const allBooks = await bookDAO.getAll(page, perPage);
  res.json(allBooks);
});

router.get("/authors/stats",  async (req, res, next) => {
  console.log("AUTHOR STATS FUNCTION")

});


// Update
router.put("/:id", async (req, res, next) => {
  // console.log("put id params", req.params)
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  // console.log("delete id params", req.params)
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;