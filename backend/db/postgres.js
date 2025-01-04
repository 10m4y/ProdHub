const {Pool}=require('pg')

const pool = new Pool({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:5432,
});

const connectPostgres=()=>{
    pool.connect((err,client,release)=>{
        if(err){
            console.error('Error connecting to postgreSQL',err.stack)
        }else{
            console.log('Connected to postgreSQL')
        }
        release();
    });
};
module.exports = {pool,connectPostgres};