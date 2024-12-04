const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to 4BET');
});

const FILE_PATH = 'bets.json';

app.get('/bets', (req, res) => {
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/bets', (req, res) => {
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }

        let bets = JSON.parse(data);
        bets.push(req.body);

        fs.writeFile(FILE_PATH, JSON.stringify(bets, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to the file');
            }
            res.send('Bet data saved successfully');
        });
    });
});

app.get('/bets-data', (req, res) => {
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        try {
            const bets = JSON.parse(data);
            res.json(bets);
        } catch (parseError) {
            res.status(500).send('Error parsing the JSON data');
        }
    });
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
