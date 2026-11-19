import express from 'express';
import { Order } from '../models/Order.js';
import { Listing } from '../models/Listing.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate agricultural order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `AGR-${timestamp}-${random}`;
};

// @route   POST /api/orders
// @desc    Place a bulk produce order (Buyer)
router.post('/', authenticate, authorize('buyer', 'admin'), async (req, res) => {
  try {
    const { listingId, quantity, deliveryAddress, deliveryNotes } = req.body;

    if (!listingId || !quantity || !deliveryAddress) {
      return res.status(400).json({ message: 'Listing, quantity, and delivery address are required.' });
    }

    const orderQty = Number(quantity);
    if (isNaN(orderQty) || orderQty <= 0) {
      return res.status(400).json({ message: 'Invalid order quantity.' });
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      return res.status(400).json({ message: 'Complete delivery address (street, city, state, pincode) is required.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Produce listing not found.' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: `This listing is currently ${listing.status} and cannot be ordered.` });
    }

    if (orderQty < listing.minimumOrderQuantity) {
      return res.status(400).json({
        message: `Order quantity (${orderQty} ${listing.unit}) is below the minimum order quantity of ${listing.minimumOrderQuantity} ${listing.unit}.`,
      });
    }

    if (orderQty > listing.quantity) {
      return res.status(400).json({
        message: `Requested quantity exceeds available stock (${listing.quantity} ${listing.unit} available).`,
      });
    }

    // Calculate total amount
    const totalAmount = Number((orderQty * listing.unitPrice).toFixed(2));
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      seller: listing.seller,
      listing: listing._id,
      commodity: listing.commodity,
      grade: listing.grade,
      quantity: orderQty,
      unit: listing.unit,
      unitPrice: listing.unitPrice,
      totalAmount,
      status: 'pending',
      paymentStatus: 'escrow_hold',
      deliveryAddress,
      deliveryNotes: deliveryNotes || '',
      statusTimeline: [
        {
          status: 'pending',
          note: `Bulk order initiated for ${orderQty} ${listing.unit} of ${listing.commodity} (${listing.grade}).`,
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    // Deduct stock from listing
    listing.quantity -= orderQty;
    if (listing.quantity <= 0) {
      listing.quantity = 0;
      listing.status = 'sold_out';
    }
    await listing.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email companyName phone')
      .populate('seller', 'name email companyName phone verifiedSeller')
      .populate('listing');

    res.status(201).json({
      message: 'Bulk order placed successfully! Pending seller acceptance.',
      order: populatedOrder,
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ message: err.message || 'Failed to place order.' });
  }
});

// @route   GET /api/orders/buyer/my-orders
// @desc    Get order history for current buyer
router.get('/buyer/my-orders', authenticate, authorize('buyer', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('seller', 'name companyName phone verifiedSeller')
      .populate('listing', 'title commodity variety grade images origin unit')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error('[Buyer Orders Error]:', err);
    res.status(500).json({ message: 'Failed to fetch buyer orders.' });
  }
});

// @route   GET /api/orders/seller/my-orders
// @desc    Get incoming orders for current seller
router.get('/seller/my-orders', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('buyer', 'name companyName email phone location')
      .populate('listing', 'title commodity variety grade images unit')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error('[Seller Orders Error]:', err);
    res.status(500).json({ message: 'Failed to fetch incoming orders.' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email companyName phone location')
      .populate('seller', 'name email companyName phone location verifiedSeller')
      .populate('listing');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Authorization check: buyer, seller, or admin only
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Access denied to this order.' });
    }

    res.json({ order });
  } catch (err) {
    console.error('[Get Order Error]:', err);
    res.status(500).json({ message: 'Failed to retrieve order details.' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update fulfillment status (Seller or Admin)
router.put('/:id/status', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['pending', 'accepted', 'processing', 'shipped', 'delivered', 'rejected', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // If seller, check they own the order
    if (req.user.role === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to manage this order.' });
    }

    const previousStatus = order.status;
    order.status = status;

    // Handle payment status adjustments based on fulfillment
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    } else if (status === 'rejected' || status === 'cancelled') {
      order.paymentStatus = 'refunded';

      // Restore inventory to listing if previously deducted
      if (previousStatus !== 'rejected' && previousStatus !== 'cancelled') {
        const listing = await Listing.findById(order.listing);
        if (listing) {
          listing.quantity += order.quantity;
          if (listing.status === 'sold_out' && listing.quantity > 0) {
            listing.status = 'active';
          }
          await listing.save();
        }
      }
    }

    // Add entry to status history timeline
    order.statusTimeline.push({
      status,
      note: note || `Order status updated to ${status} by ${req.user.name} (${req.user.role}).`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email companyName phone location')
      .populate('seller', 'name email companyName phone location verifiedSeller')
      .populate('listing');

    res.json({
      message: `Order status updated to '${status}' successfully.`,
      order: updatedOrder,
    });
  } catch (err) {
    console.error('[Update Order Status Error]:', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (Buyer - only when pending)
router.put('/:id/cancel', authenticate, authorize('buyer'), async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own orders.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        message: `Order cannot be cancelled because it is already '${order.status}'. Contact the seller or admin.`,
      });
    }

    order.status = 'cancelled';
    order.paymentStatus = 'refunded';
    order.statusTimeline.push({
      status: 'cancelled',
      note: reason ? `Buyer cancelled: ${reason}` : 'Cancelled by buyer while in pending status.',
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await order.save();

    // Restore stock
    const listing = await Listing.findById(order.listing);
    if (listing) {
      listing.quantity += order.quantity;
      if (listing.status === 'sold_out' && listing.quantity > 0) {
        listing.status = 'active';
      }
      await listing.save();
    }

    res.json({
      message: 'Order cancelled successfully and stock restored.',
      order,
    });
  } catch (err) {
    console.error('[Cancel Order Error]:', err);
    res.status(500).json({ message: 'Failed to cancel order.' });
  }
});

export default router;
