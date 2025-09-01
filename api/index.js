const dotenv = require("dotenv")
dotenv.config({path:'./.env'})
const express = require('express');
const cors = require('cors');
const logger = require('./src/middleware/logger.middleware.js');
const apiRoutes = require('./src/routes/indexRouting.js');
const errorHandler = require('./src/middleware/errorHandler.middleware.js');

const app = express();
const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(logger);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use('/api/v1', apiRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
