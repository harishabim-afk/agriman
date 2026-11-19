import express from 'express';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Order } from '../models/Order.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin-only check to all admin routes
router.use(authenticate, authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Platform-wide KPI analytics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      verifiedSellers,
      totalListings,
      activeListings,
      totalOrders,
      ordersByStatus,
      commodityStats,
      gmvResult,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'seller', verifiedSeller: true }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$totalAmount' } } },
      ]),
      Listing.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$commodity',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            avgPrice: { $avg: '$unitPrice' },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'rejected'] } } },
        { $group: { _id: null, totalGMV: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const totalGMV = gmvResult.length > 0 ? gmvResult[0].totalGMV : 0;

    res.json({
      users: {
        total: totalUsers,
        buyers: totalBuyers,
        sellers: totalSellers,
        verifiedSellers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        delisted: await Listing.countDocuments({ status: 'delisted_by_admin' }),
      },
      orders: {
        total: totalOrders,
        statusBreakdown: ordersByStatus,
        totalGMV,
      },
      commodities: commodityStats,
    });
  } catch (err) {
    console.error('[Admin Stats Error]:', err);
    res.status(500).json({ message: 'Failed to aggregate administrative statistics.' });
  }
});

// @route   GET /api/admin/users
// @desc    List all platform users with filtering
router.get('/users', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && ['buyer', 'seller', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (status && ['active', 'suspended', 'pending_verification'].includes(status)) {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { companyName: regex }, { 'location.city': regex }];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({ users, count: users.length });
  } catch (err) {
    console.error('[Admin Users Error]:', err);
    res.status(500).json({ message: 'Failed to retrieve users.' });
  }
});

// @route   PUT /api/admin/users/:id/verify-seller
// @desc    Toggle seller verification status
router.put('/users/:id/verify-seller', async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'Only seller accounts can be verified.' });
    }

    user.verifiedSeller = verified !== undefined ? Boolean(verified) : !user.verifiedSeller;
    await user.save();

    res.json({
      message: `Seller verification status set to ${user.verifiedSeller ? 'Verified' : 'Unverified'}.`,
      user,
    });
  } catch (err) {
    console.error('[Verify Seller Error]:', err);
    res.status(500).json({ message: 'Failed to update seller verification.' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (active, suspended, pending_verification)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending_verification'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent suspending the current admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own admin account.' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: `User status updated to ${status}.`,
      user,
    });
  } catch (err) {
    console.error('[Update User Status Error]:', err);
    res.status(500).json({ message: 'Failed to update user status.' });
  }
});

// @route   GET /api/admin/listings
// @desc    Get all listings including moderated ones
router.get('/listings', async (req, res) => {
  try {
    const { status, commodity } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (commodity) filter.commodity = commodity;

    const listings = await Listing.find(filter)
      .populate('seller', 'name email companyName verifiedSeller status')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (err) {
    console.error('[Admin Listings Error]:', err);
    res.status(500).json({ message: 'Failed to retrieve listings for moderation.' });
  }
});

// @route   PUT /api/admin/listings/:id/moderate
// @desc    Moderate listing (delist, relist, add notes)
router.put('/listings/:id/moderate', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (status && ['active', 'delisted_by_admin', 'sold_out', 'archived'].includes(status)) {
      listing.status = status;
    }

    if (adminNotes !== undefined) {
      listing.adminNotes = adminNotes;
    }

    await listing.save();

    const populated = await Listing.findById(listing._id).populate(
      'seller',
      'name email companyName verifiedSeller status'
    );

    res.json({
      message: `Listing status updated to ${listing.status}.`,
      listing: populated,
    });
  } catch (err) {
    console.error('[Moderate Listing Error]:', err);
    res.status(500).json({ message: 'Failed to moderate listing.' });
  }
});

// @route   GET /api/admin/orders
// @desc    Oversee all platform orders
router.get('/orders', async (req, res) => {
  try {
    const { status, commodity } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (commodity) filter.commodity = commodity;

    const orders = await Order.find(filter)
      .populate('buyer', 'name email companyName phone location')
      .populate('seller', 'name email companyName phone location verifiedSeller')
      .populate('listing', 'title commodity variety grade images')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error('[Admin Orders Error]:', err);
    res.status(500).json({ message: 'Failed to retrieve administrative orders list.' });
  }
});

export default router;
