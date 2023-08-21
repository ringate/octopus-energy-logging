const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;
const upload = multer({ dest: 'data/' });

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = `./data/${req.file.originalname}`;
    fs.rename(req.file.path, filePath, err => {
        if (err) return res.status(500).send('Failed to save file.');

        res.send('File saved successfully.');
    });
});

app.listen(port, () => {
    console.log(`Receiver app listening at http://localhost:${port}`);
});
