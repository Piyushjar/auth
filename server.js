const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({path: './config.env'});

const DB=process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true,
    useUnifiedTopology: true
}).then((con)=>{
    // console.log(con.connections);
    console.log('DB connection established');
});

const port=process.env.PORT;
app.listen(port,()=>{
    console.log(`App listening on port ${port}`)
});