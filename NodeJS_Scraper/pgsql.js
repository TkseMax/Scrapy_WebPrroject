const {Client} = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "RootUser*0",
    database: "scrapedData"
})

client.connect();

client.query("CREATE TABLE productData(id int PRIMARY KEY, url text, name text, price int, comPrice int, comQuantity int, comUnit VARCHAR(9), timestamp timestamptz)", (err, res)=>{
    if(!err){
        console.log("Table Created");
    } else {
        console.log(err.message);
    }
    client.end();
});