const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insurance_db';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB подключена:', uri.replace(/\/\/.*@/, '//***@'));
    return;
  } catch (error) {
    if (process.env.MONGODB_URI) {
      throw error;
    }
  }

  console.log('Локальная MongoDB не найдена. Запуск встроенной базы...');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const memUri = memoryServer.getUri('insurance_db');
  await mongoose.connect(memUri);
  console.log('Встроенная MongoDB запущена (данные сохраняются до остановки сервера)');
}

module.exports = connectDB;
