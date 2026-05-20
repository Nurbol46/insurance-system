const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Service = require('../models/Service');

const defaultServices = [
  {
    title: 'Автострахование',
    description: 'ОСАГО, КАСКО, помощь на дороге и защита от ущерба.',
    category: 'auto',
    price: 45000,
  },
  {
    title: 'Медицинское страхование',
    description: 'ДМС для сотрудников, личное медицинское страхование и экстренная помощь.',
    category: 'health',
    price: 32000,
  },
  {
    title: 'Имущественное страхование',
    description: 'Защита квартиры, дома, бизнеса и имущества от рисков.',
    category: 'property',
    price: 28000,
  },
  {
    title: 'Страхование жизни',
    description: 'Финансовая поддержка семьи, накопительные и инвестиционные программы.',
    category: 'life',
    price: 55000,
  },
];

async function seedDatabase() {
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(defaultServices);
    console.log('Добавлены страховые услуги по умолчанию');
  }

  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const password = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Администратор',
      email: 'admin@insurance.kz',
      phone: '+7 700 000 0001',
      password,
      role: 'admin',
    });
    console.log('Создан администратор: admin@insurance.kz / admin123');
  }
}

module.exports = seedDatabase;
