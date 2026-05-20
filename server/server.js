require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');
const apiRouter = require('./routes/api');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api', apiRouter);

async function start() {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(port, () => {
      console.log(`Сервер запущен: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Ошибка запуска:', error.message);
    console.error('Убедитесь, что MongoDB запущена (mongodb://127.0.0.1:27017)');
    process.exit(1);
  }
}

start();
