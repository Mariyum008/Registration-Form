const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;

// Load environment variables from .env file
require('dotenv').config();

// Serve static files from the "pages" directory
app.use(express.static(path.join(__dirname, "pages")));

// MongoDB connection credentials
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

console.log('MongoDB Username:', username);
console.log('MongoDB Password:', password);

// Construct the MongoDB connection URL
const url = `mongodb+srv://${username}:${password}@cluster0.kaw7h.mongodb.net/registrationFormDB`;

// Connect to MongoDB
mongoose.connect(url, {
    //  the following options to avoid deprecation warnings
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define the schema and model for registration
const registrationSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    gender: String,
    password: String
});

const Registration = mongoose.model("Registration", registrationSchema);

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the HTML file for the registration form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "index.html"));
});

// Handle form submission
app.post("/register", async (req, res) => {
    try {
        // Extract form data from the request body
        const { name, age, email, gender, password } = req.body;

        // Check if the user already exists
        const existingUser = await Registration.findOne({email : email});
        
        if (!existingUser) {
            // Create a new registration entry
            const registrationData = new Registration({
                name,
                age,
                email,
                gender,
                password
            });

            // Save the new registration entry to the database
            await registrationData.save();
            
            // Redirect to the success page
            res.redirect("/successfull");
        } else {
            // Redirect to the error page with a message
            res.redirect("/error?message=User already exists");
        }
    } catch (error) {
        // Log and handle errors
        console.log('Error during registration:', error);
        res.redirect("/error");
    }
});

// Serve the success page
app.get("/successfull", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "successfull.html"));
});

// Serve the error page
app.get("/error", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "error.html"));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
