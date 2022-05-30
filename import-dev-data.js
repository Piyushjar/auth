const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./models/tourModel')

dotenv.config({path: './config.env'}); 

const DB=process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true,
}).then((con)=>{
    console.log(con.connections);
    console.log('DB connection established !');
});

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'))

//IMPORT DATA INTO DB
const importData = async () =>{
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded');
    }
    catch(err){
        console.log(err);
    }
    process.exit();
}

//DELETING DATA FROM DB
const deleteData = async () =>{
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    }
    catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]==='--import'){
    importData();
}
else if(process.argv[2]==='--delete'){
    deleteData();
}
