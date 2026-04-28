const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const [
      totalCustomers,
      totalLeads,
      totalDeals,
      pendingTasks,
      activeCustomers,
      newLeadsThisMonth,
      wonDeals,
      deals
    ] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(),
      Deal.countDocuments(),
      Task.countDocuments({ status: 'pending', assignedTo: req.user.id }),
      Customer.countDocuments({ status: 'active' }),
      Lead.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Deal.countDocuments({ stage: 'closed_won' }),
      Deal.find({ stage: 'closed_won' })
    ]);

    const totalRevenue = deals.reduce((sum, deal) => sum + deal.value, 0);

    // Lead status breakdown
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly deals data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyDeals = await Deal.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$value' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalCustomers, totalLeads, totalDeals, pendingTasks,
      activeCustomers, newLeadsThisMonth, wonDeals, totalRevenue,
      leadsByStatus, monthlyDeals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
