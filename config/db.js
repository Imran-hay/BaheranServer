const mongoose = require('mongoose');
require('dotenv').config();

const connect = async()=>{

    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0.e1crf.mongodb.net/${process.env.MONGODB}?retryWrites=true&w=majority`)
        console.log("connected")
      
        
    } catch (error) {

        console.log(error)
        
    }


}

module.exports = {connect}