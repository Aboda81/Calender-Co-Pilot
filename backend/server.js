const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Tutor = require("./tutorModel")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser")
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.geminiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "return the result of the text in json format with no spaces nor newlines {sat:[{from,to}],sun:[{from,to}],mon:[{from,to}],tue:[{from,to}],wed:[{from,to}],thu:[{from,to}],fri:[{from,to}]}. convert to 24 hours format. weekends are friday and saturday.sunday is not weekend. noon means 12pm . midnight means 12 AM. if the from or the to field is empty do not include it",
   });
// Initialize app
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', 
    credentials: true,              
  };
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());    

// MongoDB connection
mongoose.connect(process.env.MONGO_DB_URI);
// Schedule Generation
app.post('/api/test', async(req,res)=>{
    const { prompt } = req.body;
    try{
        const result = await model.generateContent(prompt);
        console.log(JSON.parse(result.response.text()));
        res.status(200).json(JSON.parse(result.response.text()));
    }
    catch(error){
        res.status(500).json({message:error.message})
    }

});
// confirm Schedule and add it to DB
app.post('/api/confirm',async(req,res)=>{
    const {schedule} = req.body;
    console.log(schedule,"schedule");
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await Tutor.findByIdAndUpdate(decoded.id,{schedule:schedule})
    res.status(200).json(response)
})
// login with credintials
app.post('/api/login',async (req,res)=>{
        
        const { username, password } = req.body;
        console.log(username);
        
    
        try {
            let tutor = await Tutor.findOne({username});
            if (!tutor) {
                return res.status(400).json({ msg: 'This username is not registered' });
            }
    
            const isMatch = await bcrypt.compare(password, tutor.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Wrong password' });
            }
    
            const payload = {
                
                    id: tutor._id
            };
    
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '10h' },
                (err, token) => {
                    if (err) throw err;
                     res.cookie('jwt',token)
                    res.json(tutor);
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }    
});
// register with unique username 
app.post('/api/register',async(req,res)=>{
    console.log("register");
    
        const { name, username, password } = req.body; 
        try {
            let tutor = await Tutor.findOne({ username });
            
            if (tutor) {
                return res.status(400).json({ msg: 'tutor already exists' });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            tutor = new Tutor({
                name,
                username,
                password: hashedPassword,
            });
            await tutor.save()
    
            const payload = {id:tutor._id}
        
    
            jwt.sign(
                payload,
                process.env.JWT_SECRET, 
                { expiresIn: '10h' },
                 (err, token) => {
                    if (err) throw err;
                    res.cookie('jwt',token)
                    res.json(tutor);
    
                }
            );
        } catch (err) {
            console.error(err.message,);
            res.status(500).send('Server error');
        }    
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
