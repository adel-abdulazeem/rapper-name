const express = require('express');
const app = express();
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path'); 
const cron = require("node-cron");
const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'))



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.'));

app.use(express.json());

// Improved Arabic normalization function
function normalizeArabicName(name) {
    return name
        .normalize('NFKC')
        .replace(/\d/g, '') // Remove digits
        .replace(/[\u064B-\u065F]/g, '') // Remove diacritics (Tashkeel)
        .replace(/[آأإ]/g, 'ا') // Normalize Alef variations
        .replace(/ى/g, 'ي') // Normalize final 'ى' to 'ي'
        .replace(/ة/g, 'ه') // Normalize 'ة' to 'ه'
        .replace(/ـ+/g, '') // Remove Tatweel
        .replace(/[^\u0600-\u06FF\s]/g, '') // Remove non-Arabic characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim(); // Trim leading/trailing spaces
}

app.get('/', (req, res) => {
    res.render('search'); 
});
app.post('/search-name/:name', async (req, res) => {
    try {
        const searchName = normalizeArabicName(req.params.name)
        const matches = jsonData.filter(entry => 
            entry.normalizedName.includes(searchName)
        );

        if (matches.length > 0) {
            res.json({
                found: true,
                count: matches.length,
                matches: matches.map(match => ({
                    number: match.number,
                    normalizedName: match.normalizedName,
                    originalName: match.originalName
                }))
            });
        } else {
            res.status(404).json({
                found: false,
                message: 'Name not found in PDF'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message
        });
    }
});

cron.schedule('*/9 * * * *', async () => {
    try {
      const response = await fetch('https://ucl-year-winner.onrender.com', {
        method: 'GET',
      });
      console.log('Response:');
    } catch (error) {
      console.error('Error:', error);
    }
  });


// Start the server
const PORT = 8000 || 2152
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});



