const mongoose = require('mongoose');

const Book = require('../models/book');
const Author = require('../models/author');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

//Get books by author id

module.exports.getByAuthorId = async (authorIdReq) => {
  // console.log("DAO File")
  // console.log("author id req is ", authorIdReq)
  const getBooks = Book.find({authorId: authorIdReq}).lean()
  return getBooks;
  // if (!mongoose.Types.ObjectId.isValid(authorIdReq)) { //NEED HELP WITH OBJECT ID IS VALID
  //   return null;
  // } else {
  // }

}

//Get author info

module.exports.getAuthorDetails = async (bookIdForAuthor) => { 
  const getAuthorDetail = Author.find({_id:bookIdForAuthor}).lean()
  // console.log("DAO FILE")
  // console.log("book author id is ", bookIdForAuthor)
  return getAuthorDetail

}


module.exports.getSearchResults = async (searchQuery) => {
  // console.log("DAO FILE")
  // console.log(searchQuery)
  const searchDb = Book.find({
    $text: {$search: searchQuery.toString()} },
    {score: {$meta: 'textScore'}}).sort({score: {$meta: 'textScore'}}).lean()
  return searchDb 
}
  module.exports.getAuthorStatsInfoTrue = () => {
    // console.log("DAO STATS FUNCTION")
    return Book.aggregate([
      {$group: {
        "_id": "$authorId",                    
        averagePageCount: {$avg: "$pageCount"},
        numBooks: {$sum: 1},
        titles: {$push: "$title"}
      }},  
      {$lookup: {
        from: "authors",
        localField: "_id",
        foreignField: "_id",
        as: "author" }
      },
      {$unwind: "$author"
      },
      {$project: {
        authorId: "$author._id",
        _id: 0,
        numBooks: 1,
        titles: 1,
        author:1,
        averagePageCount: 1
        }          
      }
    ])
  }
 
  module.exports.getAuthorStats = () => {
    // console.log("DAO STATS FUNCTION")
    return Book.aggregate([
      {$group: {
        _id: "$authorId",                    
        averagePageCount: {$avg: "$pageCount"},
        numBooks: {$sum: 1},
        titles: {$push: "$title"}
       }  
      },
      {$project: {
        _id: 0,
        authorId: "$_id",  
        numBooks: 1,
        titles: 1,
        author:1,
        averagePageCount: 1
      }
      }
    ])
  }


module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}


module.exports.checkIsbn = async (isbn) => {
  // console.log("DAO isbn is ", isbn)
  const checkIsbn = await Book.find({ISBN: isbn});
  const checkIsbnLength = checkIsbn.length
  // console.log("check isbn in dao function" , checkIsbnLength)
  if(checkIsbn.length > 0){
    return true
  } else {
    return false
  }
}


module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;