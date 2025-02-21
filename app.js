const path = require('path');
const fs = require('fs');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://supercluster.d83jj.mongodb.net/superData', {
            user: 'superuser',
            pass: 'SuperPassword',
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connection Successful');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1); // Exit if DB connection fails
    }
}

// Call the function to connect to MongoDB
connectDB();

const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

const planetModel = mongoose.model('planets', dataSchema);

app.post('/planet', async (req, res) => {
    try {
        const planetData = await planetModel.findOne({ id: req.body.id });
        if (!planetData) {
            res.status(404).send("Planet not found. Select a number from 0 - 9.");
        } else {
            res.send(planetData);
        }
    } catch (error) {
        console.error("Error fetching planet data:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/api-docs', (req, res) => {
    fs.readFile('oas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/os', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
});

app.get('/live', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ "status": "live" });
});

app.get('/ready', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({ "status": "ready" });
});

app.listen(3000, () => { console.log("Server successfully running on port - 3000"); });

module.exports = app;

// Uncomment if using serverless deployment
// module.exports.handler = serverless(app);
