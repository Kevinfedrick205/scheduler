// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/transportation_queue', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const customerSchema = new mongoose.Schema({
  customerId: String,
  customerName: String,
  pickUpLocation: String,
  dropOffLocation: String,
});

const plannerSchema = new mongoose.Schema({
  date: Date,
  slots: {
    slot1: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    slot2: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    slot3: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    slot4: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  },
});

const Customer = mongoose.model('Customer', customerSchema);
const Planner = mongoose.model('Planner', plannerSchema);

// Dummy data
const dummyCustomers = [
  {
    customerId: '1',
    customerName: 'John Doe',
    pickUpLocation: 'A',
    dropOffLocation: 'B',
  },
  {
    customerId: '2',
    customerName: 'Jane Smith',
    pickUpLocation: 'C',
    dropOffLocation: 'D',
  },
  // Add more dummy customers as needed
];

const dummyPlannerData = [
  {
    date: new Date(),
    slots: {
      slot1: dummyCustomers[0]._id,
      slot2: dummyCustomers[1]._id,
      slot3: null,
      slot4: null,
    },
  },
  // Add more dummy planner data as needed
];

// Insert dummy data
const insertDummyData = async () => {
  await Customer.deleteMany({});
  await Planner.deleteMany({});

  const insertedCustomers = await Customer.insertMany(dummyCustomers);
  dummyPlannerData[0].slots.slot1 = insertedCustomers[0]._id;
  dummyPlannerData[0].slots.slot2 = insertedCustomers[1]._id;

  await Planner.insertMany(dummyPlannerData);
};

// Call the function to insert dummy data
insertDummyData();

app.get('/api/customers', async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

app.get('/api/planner', async (req, res) => {
  const plannerData = await Planner.find().populate('slots.slot1 slots.slot2 slots.slot3 slots.slot4');
  res.json(plannerData);
});

app.put('/api/planner/:date/:slot', async (req, res) => {
  const { date, slot } = req.params;
  const { customerId } = req.body;

  const planner = await Planner.findOne({ date });
  planner.slots[slot] = customerId;

  await planner.save();
  res.json(planner);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
