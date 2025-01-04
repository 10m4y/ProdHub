const mongoose=requie('mongoose');

mongoose.connect('mongodb://localhost:27017/prodhub',{useNewUrlParser:true,useUnifiedTopology:true})

mongoose.connection.on('connected',()=>console.log('Connected to MongoDb'));
mongoose.connection.on('error',(err)=>console.log('Error in connection to MongoDb',err));

module.exports = mongoose;