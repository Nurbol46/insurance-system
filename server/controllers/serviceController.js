const Service = require('../models/Service');

async function getServices(req, res) {
  const services = await Service.find().sort({ createdAt: 1 });
  return res.json(services);
}

async function createService(req, res) {
  const { title, description, category, price } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Заполните название, описание и категорию.' });
  }

  const service = await Service.create({
    title,
    description,
    category,
    price: Number(price) || 0,
  });

  return res.status(201).json(service);
}

async function updateService(req, res) {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price) || 0,
    },
    { new: true, runValidators: true }
  );

  if (!service) {
    return res.status(404).json({ message: 'Услуга не найдена.' });
  }

  return res.json(service);
}

async function deleteService(req, res) {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Услуга не найдена.' });
  }
  return res.json({ message: 'Услуга удалена.' });
}

module.exports = { getServices, createService, updateService, deleteService };
