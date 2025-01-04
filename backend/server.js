const express =require('express');
const dotenv=require('dotenv');
const {connectPostgres}=require('./db/postgres');
const connectMongoDB=require('./db/mongodb');

dotenv.config();

const app=express();

connectPostgres();

connectMongoDB();

app.use(express.json());



app.get('/',(req,res)=>{
    res.send("Api is running");
})
const port=process.env.SERVER_PORT||3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
