const express= require('express');
const mysql = require('mysql2/promise');
const cors= require('cors');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');
require('dotenv').config()

const app= express()

app.use(express.json())
app.use(cors())

const dbCredentials={
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 25060,
    ssl: { rejectUnauthorized: false },
}

const PORT = 3000;
let dbConnection
const connectAndStartServer= async ()=>{
    try{
        dbConnection= await mysql.createConnection(dbCredentials)
        console.log('Connected to the database!');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }catch(err){
        console.log('Error While Connecting:', err)
        process.exit(1)
    }
}

connectAndStartServer()

app.get('/api/userpayment', async (req, res)=>{
    try{
        if (!dbConnection){
            return res.status(500).json({ error: 'Database connection is not established' });
        }
        const selectQuery = 'SELECT * FROM user_payment_details';
        const [users] = await dbConnection.query(selectQuery); 
        res.json(users);
    }catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post('/api/user/payment', async (req, res)=>{
    try{
        if (!dbConnection){
            return res.status(500).json({error: 'Database connection is not established'})
        }
        const {fullName, cardNumber, expirationDate, securityCode, country, state, 
            city, addressLine1, addressLine2, postalCode, billingCycle, termsAccepted, planId}= req.body
        if (fullName === ""|| cardNumber==="" || expirationDate=== "" || securityCode==="" || country=== ""||
            state === ""|| city==="" || addressLine1=== "" || addressLine2==="" || postalCode=== "" || billingCycle===''
            || termsAccepted==="" || planId===""){
            return res.status(400).json({message: "All the details should be provided"})
        }else{
            if (termsAccepted === false){
                terms=0
            }else{
                terms=1
            }
            const insertQuery = 'INSERT INTO user_payment_details (full_name, card_number, expiry_date, security_code, country, state, city, address_line_1, address_line_2, postal_code, billing_cycle, terms_accepted, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
            await dbConnection.query(insertQuery, [fullName, cardNumber, expirationDate, securityCode, 
                country, state, city, addressLine1, addressLine2, postalCode, billingCycle, terms, planId])
            res.status(200).json({ message: 'User payment details added successfully' });
        }
    }catch (error){
                console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.delete('/api/deleteuserpatment/', async (req, res)=>{
    try{
        if (!dbConnection){
            return res.status(500).json({error: 'Database connection is not established'})
        }
        const deleteSQL= `Delete from user_payment_details where idElite_payment_premium_form= 2`
        await dbConnection.query(deleteSQL)
        res.status(200).json({message: "user details deleted Successfully"})
    }catch(e){
        console.error('Error fetching users:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})