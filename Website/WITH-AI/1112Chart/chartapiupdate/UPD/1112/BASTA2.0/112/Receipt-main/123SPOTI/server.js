// server.js

const express = require('express');
const app = express();
const port = 3000;

// Import the functionApply module
const functionApply = require('./functionApply');

// Use the function from the module
functionApply();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
