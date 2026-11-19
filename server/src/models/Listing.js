import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: 120,
    },
    commodity: {
      type: String,
      required: [true, 'Commodity is required'],
      enum: {
        values: ['Paddy', 'Corn', 'Peanuts'],
        message: 'Commodity must be either Paddy, Corn, or Peanuts',
      },
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: 'Standard',
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      enum: {
        values: ['Grade A', 'Grade B', 'Grade C'],
        message: 'Grade must be Grade A, Grade B, or Grade C',
      },
      index: true,
    },
    moisturePercentage: {
      type: Number,
      required: [true, 'Moisture percentage is required'],
      min: [0, 'Moisture percentage cannot be negative'],
      max: [50, 'Moisture percentage cannot exceed 50%'],
    },
    quantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      default: 'Metric Tons',
      enum: ['Metric Tons', 'Quintals', 'kg', 'Bags (50kg)'],
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    origin: {
      state: { type: String, required: true, trim: true, index: true },
      district: { type: String, required: true, trim: true },
      farmLocation: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    harvestDate: {
      type: Date,
      default: Date.now,
    },
    packagingType: {
      type: String,
      default: 'Jute Bags',
    },
    description: {
      type: String,
      maxlength: 1500,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'sold_out', 'delisted_by_admin', 'archived'],
      default: 'active',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for searching
listingSchema.index({ commodity: 1, grade: 1, unitPrice: 1, 'origin.state': 1, status: 1 });

export const Listing = mongoose.model('Listing', listingSchema);
