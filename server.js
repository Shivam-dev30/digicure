console.log("Server is starting...");
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware to check incoming requests
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Endpoint to handle form submission
app.post('/register', (req, res) => {
    console.log("Received POST request at /register"); // Debugging line to confirm the route is hit
    const { name, email, password } = req.body;
    const filePath = './users.xlsx'; // Define filePath here
    console.log("File Path:", filePath); // Log the file path to check

    // Initialize workbook and worksheet variables
    let workbook;
    let worksheet;
    try {
        // Check if the file exists
        console.log('Checking if file exists...');
        if (fs.existsSync(filePath)) {
            console.log('File exists. Reading...');
            workbook = xlsx.readFile(filePath);
            worksheet = workbook.Sheets['Users'];
        } else {
            console.log('File does not exist. Creating a new one...');
            workbook = xlsx.utils.book_new();
            worksheet = xlsx.utils.aoa_to_sheet([['Name', 'Email', 'Password']]); // Add headers
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Users');
        }

        // Read current data from worksheet
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Current data:', data);

        // Append new user data
        data.push([name, email, password]);

        // Create a new worksheet with updated data
        const newWorksheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets['Users'] = newWorksheet;

        // Save the workbook
        xlsx.writeFile(workbook, filePath);
        console.log('File created/updated successfully at', filePath);

        // Send response back to user
        res.send('Registration successful! Your data has been saved.');
    } catch (error) {
        console.error('Error while handling file:', error.message);
        res.status(500).send('An error occurred while saving your data.');
    }
});

// Serve the registration page (index.html) for testing
app.get('/', (req, res) => {
    console.log("Serving the registration page...");
    res.sendFile(__dirname + '/frontend/index.html');
});

// Start the server on port 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
