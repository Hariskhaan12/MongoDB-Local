// to install locally you have to install mongodb driver > npm install mongodb --save
const express = require('express');
const app = express();
const {ObjectId, Collection}=require('mongodb')
const { connectToDB, getDB } = require('./db')

let db;
// connect to DATABASE
// we call the CB function weather the connection pass or failed but in failed cass we pass an error
connectToDB((err) => { // NOW THE CALLBACK FUNCTION HELPS HERE 
    if (!err) {
      // that means connection succesfully establish   
    app.listen(4000, () => {
    console.log("server is listening on Port 4000");
});
    } 
    db=getDB()// after succesfull we can get the instance of that database
    
})



app.use(express.json());

app.get('/', (req, res) => {
    res.send("<h1>Home Page</h1>")
})
// mongoDb fetch returns documents in baches not return whole at once one batch incl roughly around 101 documents.
    // bcze if coll have alot of doc & we fetch all at once it will increase bandwidth.
app.get('/all-books', (req, res) => {
    let books=[]
    db.collection("books")
        .find()    // returns a cursor then 2 methods we can use > toArray , forEach
        .sort({ author: 1 })
        .forEach((book) => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch((err) => {
            res.status(500).json({msg:"Error Fetching The Data"})
            console.log(err);
        })
    // res.json({msg:"All books are Here"})
})



  //Single Book
app.get('/book/:id', (req, res) => {
   // because Object.ID has some special check for id so we need to check  that first than if it is mathced or not
    if (ObjectId.isValid(req.params.id))
    {
        db.collection('books').findOne({ _id: ObjectId(req.params.id) })
            .then((document) => {
            res.status(200).json(document)
            })
            .catch((err) => {
                res.status(404).json({msg:"404.! Could'nt find the book with this ID"})
            console.log(err);
        })
        
    }
    else {
        res.status(500).json({error:"Id is not a string of 12 bytes or 24 hex characters or an integer"})
    }
})
// post
app.post('/books', (req, res) => {
    const Book = req.body
    
    db.collection('books').insertOne(Book)
        .then((result) => {
        res.status(201).json(result)
        })
        .catch((err) => {
        res.status(500).json({error:err})
    })
})

// delete
app.delete('/books/:id', (req,res) => {
    if (ObjectId.isValid(req.params.id))
    {
        db.collection('books').deleteOne({ _id: ObjectId(req.params.id) })
            .then((result) => {
            res.json(result)
            })
            .catch((err) => {
            res.status(500).json({error:err})
        })
    }
    else {
        res
          .status(500)
          .json({
            err: "Id is not a string of 12 bytes or 24 hex characters or an integer",
          });
    }
})


// patch ? to update Specific Fields ..

app.patch("/books/:id", (req, res) => {
    const updates = req.body;
    if (ObjectId.isValid(req.params.id)) {
      db.collection("books")
        .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          res.status(500).json({ error: err });
        });
    } else {
      res.status(500).json({
        err: "Id is not a string of 12 bytes or 24 hex characters or an integer",
      });
    }
})

                    //>>>>>  (when we have more like 1k books then we doesnot want to show all of it.)

//PAGINATION

app.get("/books", (req, res) => {
    // console.log(req.query.p);
    const pages = req.query.p||0; // if req.query have value ok otherise set 0
    const BooksPerPage = 2; // set no.of books u want to show per page
   
    let Books = [];

    db.collection("books")
      .find()
      .sort({ author: 1 })
      .skip(pages * BooksPerPage)
        .limit(BooksPerPage)
        .forEach(book =>Books.push(book))
      .then(() => {
        res.status(200).json(Books);
      })
      .catch((err) => {
        res
          .status(404)
          .json({ msg: "404.! Could'nt find the book with this ID" });
        console.log(err);
      });
 
});


// ........................................// INDEXES.....................
// it allow db server to perform specific Query much more effeciently without examine entire Collection

// ex: db.collection().find({rating:10})
// MongoDb will scan the entire collection to check where rating is 10 and fetch that document

// let suppose we set rating as a index
// then that index is going to point out to their corresponding Book

// Collection               indexes(Book Rating)
// doc 1                    7
// doc 2                    10  now mongoDB will look here find that index and get corresponding Book/ doc
// doc 2                    7
// doc 2                    10
// etc

//use Indexes only for some spefic queries like if u have alot books then for sotring u can do that
// but the more indexes u do the more work u have to do when changes occur.

// for execution check use this
// > db.books.find({rating:6}).explain('executionStats')
// u will notice that mongoDB have to examine all 4 docs and find 1 that matches

// that's why we create Indexes.

// To create INDEX

//  db.books.createIndex({rating:6})

// TO SHOW ALL INDEXES

// db.books.getIndexes();

// then run this db.books.find({rating:6}).explain('executionStats') u will see doc examined=1 and return =1


// to remove index

// db.books.dropIndex({rating:6})


