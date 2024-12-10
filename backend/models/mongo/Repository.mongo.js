const mongoose=require('mongoose');

const RepositorySchema = new mongoose.Schema({
    name:{type:String,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
    description:{type:String,default:''},
    contributors:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}

});

module.exports = mongoose.model('Repository',RepositorySchema);