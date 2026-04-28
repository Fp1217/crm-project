const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const deals = await Deal.find()
      .populate('customer', 'name email company')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const deal = new Deal({ ...req.body, assignedTo: req.user.id });
    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true }
    ).populate('customer', 'name email company');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
