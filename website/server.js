const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const sequelize = require('sequelize');
const sqlite3 = require('sqlite3');
const User = require('./models/user');
const app = express();
const path = require('path');
const fetch = require('node-fetch');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/bets', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bets.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

app.get('/style', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// Load the config file
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

const dbPath = path.resolve(__dirname, 'users.db');
console.log('Database Path:', dbPath);

const apiOptions = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': config.RAPIDAPI_KEY,
    }
};

const fixturesUrl = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&next=20';

// Fetch fixtures from the API
app.get('/api/fixtures', async (req, res) => {
    try {
        const response = await fetch(fixturesUrl, apiOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data); // Send the API response to the client
    } catch (error) {
        console.error('Error fetching fixtures:', error);
        res.status(500).json({ message: 'Error fetching data from API' });
    }
});

// Example endpoint to fetch odds for a specific fixture
app.get('/api/odds/:fixtureId', async (req, res) => {
    const fixtureId = req.params.fixtureId;
    const oddsUrl = `https://api-football-v1.p.rapidapi.com/v3/odds?fixture=${fixtureId}&league=39&season=2024`;

    try {
        const response = await fetch(oddsUrl, apiOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const oddsData = await response.json();
        res.json(oddsData); // Send the odds data to the client
    } catch (error) {
        console.error('Error fetching odds:', error);
        res.status(500).json({ message: 'Error fetching odds from API' });
    }
});


// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

const FILE_PATH = 'bets.json';

app.get('/bets', (req, res) => {
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/bets', (req, res) => {
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

app.get('/get-net-winnings', (req, res) => {
    fs.readFile('win.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        try {
            const jsonData = JSON.parse(data);
            res.send({ netWinnings: jsonData[0].net });
        } catch (parseError) {
            res.status(500).send('Error parsing JSON');
        }
    });
});

// Endpoint to set net winnings
app.post('/set-net-winnings', (req, res) => {
    const { netWinnings } = req.body;

    // Validate input
    if (typeof netWinnings !== 'number') {
        return res.status(400).send('Invalid input: netWinnings must be a number');
    }

    fs.readFile('win.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        try {
            const jsonData = JSON.parse(data);
            jsonData[0].net = netWinnings; // Update the net winnings value

            // Write the updated JSON back to the file
            fs.writeFile('win.json', JSON.stringify(jsonData, null, 2), (writeError) => {
                if (writeError) {
                    return res.status(500).send('Error writing to file');
                }
                res.send('Net winnings updated successfully');
            });
        } catch (parseError) {
            res.status(500).send('Error parsing JSON');
        }
    });
});

// Endpoint to update win.json
app.post('/update-win', (req, res) => {
    const { net } = req.body;

    fs.readFile('win.json', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file' });
        }

        const winData = JSON.parse(data);
        winData[0].net += net;

        fs.writeFile('win.json', JSON.stringify(winData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error writing to file' });
            }
            res.status(200).json({ message: 'File updated successfully' });
        });
    });
});

app.post('/remove-bet', (req, res) => {
    const { fixtureId } = req.body;

    // Read the bets from the JSON file
    fs.readFile('./bets.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading bets file.' });
        }

        let bets;
        try {
            bets = JSON.parse(data);
        } catch (parseError) {
            return res.status(500).json({ message: 'Error parsing bets data.' });
        }

        // Filter out the bet with the specified fixtureId
        const updatedBets = bets.filter(bet => bet.fixtureId !== fixtureId);

        // Write the updated bets back to the JSON file
        fs.writeFile('./bets.json', JSON.stringify(updatedBets, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error updating bets file.' });
            }
            res.json({ message: `Bet with fixtureId ${fixtureId} removed successfully.` });
        });
    });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Compare the provided password with the stored hash using bcrypt
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        res.status(200).json({ success: true, message: 'Login successful!' });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ success: false, message: 'Error logging in user.' });
    }
});


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already taken.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user in the database
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ success: false, message: 'Error registering user.' });
    }
});



const PORT = process.env.PORT || 3000; // Default to 5000 if PORT isn't set
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
