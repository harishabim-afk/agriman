import express from 'express';
import { Listing } from '../models/Listing.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/listings
// @desc    Get filtered listings for marketplace (Buyer / Public)
router.get('/', async (req, res) => {
  try {
    const {
      commodity,
      minPrice,
      maxPrice,
      grade,
      location,
      maxMoisture,
      search,
      sortBy = 'latest',
      page = 1,
      limit = 30,
    } = req.query;

    const filter = { status: 'active' };

    // Commodity filter (Paddy, Corn, Peanuts)
    if (commodity && ['Paddy', 'Corn', 'Peanuts'].includes(commodity)) {
      filter.commodity = commodity;
    }

    // Grade filter
    if (grade && ['Grade A', 'Grade B', 'Grade C'].includes(grade)) {
      filter.grade = grade;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.unitPrice = {};
      if (minPrice && !isNaN(Number(minPrice))) filter.unitPrice.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) filter.unitPrice.$lte = Number(maxPrice);
    }

    // Moisture % filter
    if (maxMoisture && !isNaN(Number(maxMoisture))) {
      filter.moisturePercentage = { $lte: Number(maxMoisture) };
    }

    // Location filter (matches state or district)
    if (location && location.trim()) {
      const locRegex = new RegExp(location.trim(), 'i');
      filter.$or = [{ 'origin.state': locRegex }, { 'origin.district': locRegex }];
    }

    // Text search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const searchConditions = [
        { title: searchRegex },
        { variety: searchRegex },
        { description: searchRegex },
        { 'origin.state': searchRegex },
        { 'origin.district': searchRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { unitPrice: 1 };
    else if (sortBy === 'price_desc') sortOptions = { unitPrice: -1 };
    else if (sortBy === 'moisture_asc') sortOptions = { moisturePercentage: 1 };
    else if (sortBy === 'quantity_desc') sortOptions = { quantity: -1 };
    else if (sortBy === 'latest') sortOptions = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name companyName phone location verifiedSeller status')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(filter),
    ]);

    res.json({
      listings,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('[Listings Filter Error]:', err);
    res.status(500).json({ message: 'Error retrieving produce listings.' });
  }
});

// @route   GET /api/listings/seller/my-listings
// @desc    Get all listings belonging to authenticated seller
router.get('/seller/my-listings', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .populate('seller', 'name companyName verifiedSeller')
      .sort({ createdAt: -1 });

    res.json({ listings });
  } catch (err) {
    console.error('[Seller Listings Error]:', err);
    res.status(500).json({ message: 'Failed to fetch seller listings.' });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single listing details
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'seller',
      'name companyName phone location verifiedSeller bio createdAt'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Produce listing not found.' });
    }

    res.json({ listing });
  } catch (err) {
    console.error('[Get Listing Error]:', err);
    res.status(500).json({ message: 'Failed to retrieve listing details.' });
  }
});

// @route   POST /api/listings
// @desc    Create a new produce listing (Seller)
router.post('/', authenticate, authorize('seller'), async (req, res) => {
  try {
    const {
      title,
      commodity,
      variety,
      grade,
      moisturePercentage,
      quantity,
      unit,
      minimumOrderQuantity,
      unitPrice,
      origin,
      harvestDate,
      packagingType,
      description,
      images,
    } = req.body;

    // Strict validation
    if (!title || !commodity || !grade || moisturePercentage === undefined || !quantity || !unitPrice || !origin) {
      return res.status(400).json({
        message: 'Missing required fields: title, commodity, grade, moisture %, quantity, unit price, origin.',
      });
    }

    if (!['Paddy', 'Corn', 'Peanuts'].includes(commodity)) {
      return res.status(400).json({ message: 'Commodity must be Paddy, Corn, or Peanuts.' });
    }

    if (!['Grade A', 'Grade B', 'Grade C'].includes(grade)) {
      return res.status(400).json({ message: 'Grade must be Grade A, Grade B, or Grade C.' });
    }

    if (!origin.state || !origin.district) {
      return res.status(400).json({ message: 'Origin must include state and district.' });
    }

    const newListing = await Listing.create({
      title,
      commodity,
      variety: variety || 'Standard',
      grade,
      moisturePercentage: Number(moisturePercentage),
      quantity: Number(quantity),
      unit: unit || 'Metric Tons',
      minimumOrderQuantity: Number(minimumOrderQuantity) || 1,
      unitPrice: Number(unitPrice),
      origin,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      packagingType: packagingType || 'Jute Bags',
      description: description || '',
      images: images || [],
      seller: req.user._id,
      status: 'active',
    });

    const populated = await Listing.findById(newListing._id).populate(
      'seller',
      'name companyName verifiedSeller phone location'
    );

    res.status(201).json({
      message: 'Produce listing posted successfully!',
      listing: populated,
    });
  } catch (err) {
    console.error('[Create Listing Error]:', err);
    res.status(500).json({ message: err.message || 'Failed to create listing.' });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update listing (Seller / Admin)
router.put('/:id', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // Role verification: Sellers can only edit their own listings
    if (req.user.role === 'seller' && listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this listing.' });
    }

    const {
      title,
      commodity,
      variety,
      grade,
      moisturePercentage,
      quantity,
      unit,
      minimumOrderQuantity,
      unitPrice,
      origin,
      harvestDate,
      packagingType,
      description,
      images,
      status,
    } = req.body;

    if (title) listing.title = title;
    if (commodity && ['Paddy', 'Corn', 'Peanuts'].includes(commodity)) listing.commodity = commodity;
    if (variety !== undefined) listing.variety = variety;
    if (grade && ['Grade A', 'Grade B', 'Grade C'].includes(grade)) listing.grade = grade;
    if (moisturePercentage !== undefined) listing.moisturePercentage = Number(moisturePercentage);
    if (quantity !== undefined) listing.quantity = Number(quantity);
    if (unit) listing.unit = unit;
    if (minimumOrderQuantity !== undefined) listing.minimumOrderQuantity = Number(minimumOrderQuantity);
    if (unitPrice !== undefined) listing.unitPrice = Number(unitPrice);
    if (origin) listing.origin = { ...listing.origin, ...origin };
    if (harvestDate) listing.harvestDate = new Date(harvestDate);
    if (packagingType !== undefined) listing.packagingType = packagingType;
    if (description !== undefined) listing.description = description;
    if (images !== undefined) listing.images = images;
    if (status && ['active', 'sold_out', 'delisted_by_admin', 'archived'].includes(status)) {
      listing.status = status;
    }

    await listing.save();

    const updated = await Listing.findById(listing._id).populate(
      'seller',
      'name companyName verifiedSeller phone location'
    );

    res.json({
      message: 'Listing updated successfully.',
      listing: updated,
    });
  } catch (err) {
    console.error('[Update Listing Error]:', err);
    res.status(500).json({ message: err.message || 'Failed to update listing.' });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete or archive a produce listing
router.delete('/:id', authenticate, authorize('seller', 'admin'), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // Role check: Only the owning seller or admin can delete
    if (req.user.role === 'seller' && listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete another seller’s listing.' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing removed successfully.' });
  } catch (err) {
    console.error('[Delete Listing Error]:', err);
    res.status(500).json({ message: 'Failed to delete listing.' });
  }
});

export default router;
