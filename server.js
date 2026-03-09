const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('Frontend'));

const PORT = process.env.PORT || 3000 //port number

// Json validation code
function validateJson(data){
    if (!data.pages) return false; //Check if the main 'pages' object exists
    const pageKeys = Object.keys(data.pages); //Retriving all pages names
    for (let key of pageKeys) //loop through each page
    {
        const page = data.pages[key];

        if (!page.title || !page.subtitle || !page.content){
            console.error(`Page ${key} is missing data`);
            return false; //returns false if even one key is missing data
        }
    }
    return true; //Everything is valid
}

// Set api route
app.get('/api', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'api.json');
        const jsonRawData = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(jsonRawData);

        if (!validateJson(jsonData)) {
            return res.status(400).json({ error: 'Invalid JSON structure in api.json' });
        }

        return res.json(jsonData);
    } catch (error) {
        console.error('Failed to read or parse api.json:', error.message);
        return res.status(500).json({ error: 'Failed to load API data' });
    }
});

// Setting pages routes, pretty URLs
    // Route for Citizens
    app.get('/e-stonia', (req, res) => {
        // console.log("eStonia page")
        res.sendFile(path.join(__dirname, 'Frontend', 'e-Stonia.html'));
    });

    // Route for Global
    app.get('/global', (req, res) => {
        // console.log("Global page")
        res.sendFile(path.join(__dirname, 'Frontend', 'global.html'));
    });

    // Route for Future
    app.get('/vision', (req, res) => {
        // console.log("Future page")
        res.sendFile(path.join(__dirname, 'Frontend', 'vision.html'));
    });

    // Additional route for home
    app.get('/home', (req, res) => {
        // console.log("home page")
        res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
    });



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`View API at http://localhost:${PORT}/api`);
});