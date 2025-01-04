const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        });
        console.log('Connected to MongoDB');
    }catch(err){
        console.error("error connecting to MongoDB",err);
        
    }
};

module.exports = connectMongoDB;