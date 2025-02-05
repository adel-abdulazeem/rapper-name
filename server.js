const express = require('express');
const multer = require('multer');
const app = express();
const fetch = require('node-fetch');

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path'); // Add path module

const cron = require("node-cron");


// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });
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
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/[ھه]/g, 'ه')
        .replace(/[يى]/g, 'ى')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ى')
        .replace(/[^\u0600-\u06FF\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// PDF content parser function
function parsePdfContent(text) {
    const cleanedText = text
        .replace(/(\d+)\.\s*\n/g, '$1 ')
        .replace(/([^\d])\n([^\d])/g, '$1 $2')
        .replace(/ي\s*$/gm, '')
        .replace(/\s+/g, ' ');

    const entryPattern = /(\d{4})[\s.]*(.*?)(?=\s*\d{4}|$)/gs;
    const entries = [];
    
    let match;
    while ((match = entryPattern.exec(cleanedText)) !== null) {
        const number = match[1];
        let name = match[2]
            .replace(/\d/g, '')
            .trim();

        if (name.length > 1) {
            entries.push({
                number,
                originalName: name,
                normalizedName: normalizeArabicName(name)
            });
        }
    }

    return entries;
}

// Endpoint to handle PDF upload and name search
app.get('/', (req, res) => {
    res.render('search'); // Render search.ejs template
});
app.post('/search-name', upload.single('pdf'), async (req, res) => {
    try {
        const searchName = normalizeArabicName(req.body.name);
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        fs.unlinkSync(filePath);

        const entries = parsePdfContent(pdfData.text);
        // Find all entries containing the search string
        const matches = entries.filter(entry => 
            entry.normalizedName.includes(searchName)
        );
        console.log(matches)
        // const result = entries.find(entry => 
        //     entry.normalizedName === searchName
        // );
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



