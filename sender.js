const fs = require('fs');
const FormData = require('form-data');
const chokidar = require('chokidar');
const axios = require('axios');
require('dotenv').config();

const watchDir = './data';
const receiverHost = process.env.RECEIVER_HOST;

chokidar.watch(watchDir, {ignored: /^\./, persistent: true}).on('change', (path) => {
    if (path.endsWith('.txt')) {
        fs.stat(path, (err, stats) => {
            if (err) throw err;

            // Check if file size is not empty
            if (stats.size > 0) {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(path));

                axios.post(`${receiverHost}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    console.log('File sent:', response.data);
                }).catch(err => {
                    console.error('Failed to send file:', err);
                });
            }
        });
    }
});

console.log(`Watching for changes in directory: ${watchDir}`);
