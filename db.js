const {MongoClient}=require("mongodb")


let dbConnection;

// this Connection String is same or you can also check compass to see localhost 27017 mentioned there.
const connectToDB = (cb) => {
    MongoClient.connect('mongodb://localhost:27017/BookStore')
        .then((client) => {
        dbConnection= client.db()// new database instance or interface through we can interact with database we r connected to
            return cb();//this callback function we'll pass whn we call connectToDB func 
        })
        .catch((err) => {
            console.log(err);
            return cb(err);// either we success or failed connection we return that callback function
    })
}

// this method is used to return that instance of database so we can perform operations
const getDB = () => {
    return dbConnection;
}

module.exports={connectToDB,getDB}



