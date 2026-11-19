import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './config/db.js';
import { User } from './models/User.js';
import { Listing } from './models/Listing.js';
import { Order } from './models/Order.js';

dotenv.config();

export const seedData = async () => {
  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Listing.deleteMany({});
  await Order.deleteMany({});

  console.log('[Seed] Creating demo accounts for Admin, Seller, and Buyer...');

  // 1. Admin Account
  const admin = await User.create({
    name: 'Eleanor Vance (Platform Administrator)',
    email: 'admin@agroharvest.com',
    password: 'Admin@123',
    role: 'admin',
    companyName: 'AgroHarvest National Exchange',
    phone: '+1 (555) 019-2834',
    location: {
      address: 'Suite 400, AgriCommerce Tower',
      city: 'Des Moines',
      state: 'Iowa',
      pincode: '50309',
    },
    verifiedSeller: true,
    status: 'active',
    bio: 'Platform Overseer and Chief Agricultural Compliance Officer.',
  });

  // 2. Verified Primary Seller
  const seller1 = await User.create({
    name: 'Marcus Holloway',
    email: 'seller@agroharvest.com',
    password: 'Seller@123',
    role: 'seller',
    companyName: 'Green Valley Organic Farmers Cooperative',
    phone: '+1 (555) 438-9210',
    location: {
      address: 'Highway 44, Silo complex 3',
      city: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
    },
    verifiedSeller: true,
    status: 'active',
    bio: 'Direct producer cooperative with 120+ verified member farms specializing in certified export-grade Paddy, Corn, and Peanuts.',
  });

  // 3. Second Seller (Specialist)
  const seller2 = await User.create({
    name: 'Rajesh Patel',
    email: 'gujarat.agro@agroharvest.com',
    password: 'Seller@123',
    role: 'seller',
    companyName: 'Saurashtra Oilseed & Groundnut Producers',
    phone: '+1 (555) 887-2311',
    location: {
      address: 'Plot 18, Agricultural APMC Yard',
      city: 'Rajkot',
      state: 'Gujarat',
      pincode: '360003',
    },
    verifiedSeller: true,
    status: 'active',
    bio: 'Premium peanut shellers and grain merchants with modern testing laboratories and moisture-controlled silos.',
  });

  // 4. Third Seller (Unverified / New applicant for admin to test verify/suspend)
  const seller3 = await User.create({
    name: 'Dakota Miller',
    email: 'midwest.farms@agroharvest.com',
    password: 'Seller@123',
    role: 'seller',
    companyName: 'Prairie Heartland Grain Co',
    phone: '+1 (555) 902-1144',
    location: {
      address: 'County Road 12',
      city: 'Ames',
      state: 'Iowa',
      pincode: '50010',
    },
    verifiedSeller: false,
    status: 'pending_verification',
    bio: 'Family farm offering bulk corn harvest and seasonal peanuts. Awaiting platform verification.',
  });

  // 5. Primary Buyer Account
  const buyer1 = await User.create({
    name: 'David Sterling',
    email: 'buyer@agroharvest.com',
    password: 'Buyer@123',
    role: 'buyer',
    companyName: 'Sterling Food Mills & Export Corp',
    phone: '+1 (555) 781-6452',
    location: {
      address: '740 Industrial Harbor Parkway',
      city: 'Chicago',
      state: 'Illinois',
      pincode: '60607',
    },
    verifiedSeller: false,
    status: 'active',
    bio: 'Procurement manager sourcing bulk food-grade grains and oilseeds for nationwide distribution.',
  });

  // 6. Second Buyer Account
  const buyer2 = await User.create({
    name: 'Priya Sharma',
    email: 'heritage.foods@agroharvest.com',
    password: 'Buyer@123',
    role: 'buyer',
    companyName: 'Heritage Rice Mills & Oil Refinery',
    phone: '+1 (555) 345-6789',
    location: {
      address: 'Industrial Sector 9',
      city: 'Karnal',
      state: 'Haryana',
      pincode: '132001',
    },
    verifiedSeller: false,
    status: 'active',
    bio: 'Bulk buyer of basmati paddy and quality bold peanuts.',
  });

  console.log('[Seed] Users seeded successfully.');

  // Crop / Commodity Listings
  console.log('[Seed] Seeding realistic produce listings for Paddy, Corn, and Peanuts...');

  const sampleListings = [
    // PADDY LISTINGS
    {
      title: 'Premium Basmati 1121 Paddy (Long Grain)',
      commodity: 'Paddy',
      variety: 'Basmati 1121 Extra Long',
      grade: 'Grade A',
      moisturePercentage: 11.2,
      quantity: 150,
      unit: 'Metric Tons',
      minimumOrderQuantity: 10,
      unitPrice: 42000, // ₹42,000 per Ton
      origin: {
        state: 'Punjab',
        district: 'Amritsar',
        farmLocation: 'Majha Agro Farms, Rayya',
        pincode: '143112',
      },
      harvestDate: new Date('2026-10-15'),
      packagingType: '50kg Jute Bags',
      description: 'Golden husk, naturally sun-cured traditional Basmati 1121 paddy. Moisture certified at 11.2%, ideal for long aging and high head-rice recovery mill yield (>52%). Pest-free and stored in clean elevated warehouses.',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller1._id,
      status: 'active',
    },
    {
      title: 'Sona Masoori Raw Paddy (Medium Slender)',
      commodity: 'Paddy',
      variety: 'Sona Masoori BPT-5204',
      grade: 'Grade A',
      moisturePercentage: 12.0,
      quantity: 220,
      unit: 'Metric Tons',
      minimumOrderQuantity: 15,
      unitPrice: 28500, // ₹28,500 per Ton
      origin: {
        state: 'Andhra Pradesh',
        district: 'Kurnool',
        farmLocation: 'Tungabhadra Basin Fields',
        pincode: '518002',
      },
      harvestDate: new Date('2026-10-28'),
      packagingType: 'Bulk Silo / 50kg Bags',
      description: 'Single-origin aromatic Sona Masoori paddy. Uniform grain size, free of discoloration. Moisture laboratory tested at exactly 12.0%. High milling percentage with low broken grain ratio.',
      images: [
        'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller1._id,
      status: 'active',
    },
    {
      title: 'Common Non-Basmati Paddy (Standard Milling)',
      commodity: 'Paddy',
      variety: 'IR-64 Long Grain',
      grade: 'Grade B',
      moisturePercentage: 13.5,
      quantity: 340,
      unit: 'Metric Tons',
      minimumOrderQuantity: 20,
      unitPrice: 22000, // ₹22,000 per Ton
      origin: {
        state: 'Haryana',
        district: 'Karnal',
        farmLocation: 'Taraori Grain Belt',
        pincode: '132116',
      },
      harvestDate: new Date('2026-11-02'),
      packagingType: 'PP Woven Sacks',
      description: 'IR-64 non-basmati parboiling and raw milling paddy. Cleaned and pre-screened to remove foreign matter. Ready for quick delivery by rail or heavy commercial freight.',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller1._id,
      status: 'active',
    },

    // CORN / MAIZE LISTINGS
    {
      title: 'Bright Yellow Feed Corn (High Starch & Protein)',
      commodity: 'Corn',
      variety: 'Pioneer Yellow Dent 3394',
      grade: 'Grade A',
      moisturePercentage: 12.8,
      quantity: 450,
      unit: 'Metric Tons',
      minimumOrderQuantity: 25,
      unitPrice: 21500, // ₹21,500 per Ton
      origin: {
        state: 'Iowa',
        district: 'Story County',
        farmLocation: 'Heartland Corn Silos, Ames',
        pincode: '50010',
      },
      harvestDate: new Date('2026-10-20'),
      packagingType: 'Bulk Hopper Truck / Silo',
      description: 'Top-tier Yellow Dent field corn, test weight 56 lbs/bushel, crude protein 9.2%. Moisture controlled at 12.8%. Zero aflatoxin detected. Ideal for poultry and animal feed formulation or starch industrial refining.',
      images: [
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller2._id,
      status: 'active',
    },
    {
      title: 'Flint Corn (Hard Endosperm for Grits & Masa)',
      commodity: 'Corn',
      variety: 'Hard Golden Flint',
      grade: 'Grade B',
      moisturePercentage: 13.8,
      quantity: 180,
      unit: 'Metric Tons',
      minimumOrderQuantity: 10,
      unitPrice: 23000, // ₹23,000 per Ton
      origin: {
        state: 'Madhya Pradesh',
        district: 'Chhindwara',
        farmLocation: 'Satpura Valley Producers',
        pincode: '480001',
      },
      harvestDate: new Date('2026-10-10'),
      packagingType: '50kg HDPE Sacks',
      description: 'Dense kernel hard flint maize specifically cultivated for cornmeal, masa flour, and breakfast cereals. Consistent bright orange-yellow color with exceptional milling crispness.',
      images: [
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller1._id,
      status: 'active',
    },
    {
      title: 'Sweet & Silage Processing Maize (Bulk Clearance)',
      commodity: 'Corn',
      variety: 'Kaveri Hybrid 50',
      grade: 'Grade C',
      moisturePercentage: 14.6,
      quantity: 90,
      unit: 'Metric Tons',
      minimumOrderQuantity: 15,
      unitPrice: 18500, // ₹18,500 per Ton
      origin: {
        state: 'Karnataka',
        district: 'Davanagere',
        farmLocation: 'Bathi Agricultural Yards',
        pincode: '577002',
      },
      harvestDate: new Date('2026-09-25'),
      packagingType: 'Bulk Loaded Bags',
      description: 'Industrial and fodder grade field corn. Slightly higher moisture (14.6%) suitable for immediate processing or distillery use. Offered at competitive wholesale discount.',
      images: [
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller2._id,
      status: 'active',
    },

    // PEANUTS LISTINGS
    {
      title: 'Export Quality Bold Peanuts (Count 40/50)',
      commodity: 'Peanuts',
      variety: 'Saurashtra Bold Groundnut',
      grade: 'Grade A',
      moisturePercentage: 6.8,
      quantity: 120,
      unit: 'Metric Tons',
      minimumOrderQuantity: 5,
      unitPrice: 78000, // ₹78,000 per Ton
      origin: {
        state: 'Gujarat',
        district: 'Junagadh',
        farmLocation: 'Gir Agro Produce Hub',
        pincode: '362001',
      },
      harvestDate: new Date('2026-11-05'),
      packagingType: 'Vacuum Packed Jute Bags',
      description: 'Machine sorted and electronic color-graded Bold Peanuts (40/50 count per ounce). Moisture strictly maintained under 7% (6.8% tested). Oil content 49.5%. Certified free of Aflatoxin (B1 < 2ppb). Excellent for roasting and peanut butter processing.',
      images: [
        'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller2._id,
      status: 'active',
    },
    {
      title: 'Java Peanuts (Round Kernels Count 60/70)',
      commodity: 'Peanuts',
      variety: 'Spanish Java TJ',
      grade: 'Grade A',
      moisturePercentage: 7.2,
      quantity: 85,
      unit: 'Metric Tons',
      minimumOrderQuantity: 5,
      unitPrice: 74000, // ₹74,000 per Ton
      origin: {
        state: 'Gujarat',
        district: 'Rajkot',
        farmLocation: 'Gondal APMC Mandi Sourcing',
        pincode: '360311',
      },
      harvestDate: new Date('2026-10-30'),
      packagingType: '25kg Vacuum Poly Bags',
      description: 'Classic round pink-skin Java kernels. Uniform shape, pleasant nutty taste with high natural oil composition (50.2%). Ideal for confectionery, coated snacks, and crushed paste extraction.',
      images: [
        'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller2._id,
      status: 'active',
    },
    {
      title: 'Crushing & Cold-Press Grade Peanuts (In-Shell)',
      commodity: 'Peanuts',
      variety: 'Semi-Spreading In-Shell',
      grade: 'Grade B',
      moisturePercentage: 8.4,
      quantity: 160,
      unit: 'Metric Tons',
      minimumOrderQuantity: 10,
      unitPrice: 58000, // ₹58,000 per Ton
      origin: {
        state: 'Tamil Nadu',
        district: 'Erode',
        farmLocation: 'Bhavani River Delta Cooperative',
        pincode: '638001',
      },
      harvestDate: new Date('2026-10-18'),
      packagingType: 'Standard 40kg Gunny Sacks',
      description: 'Whole dry peanut pods in shell ready for de-husking mills or expeller cold-press edible oil extraction. Shelling outturn >71%. Rich golden oil recovery guaranteed.',
      images: [
        'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80',
      ],
      seller: seller1._id,
      status: 'active',
    },
    {
      title: 'Sample Moderation Listing (Unprocessed Seed Lot)',
      commodity: 'Paddy',
      variety: 'Mixed Local Husk',
      grade: 'Grade C',
      moisturePercentage: 16.5,
      quantity: 30,
      unit: 'Metric Tons',
      minimumOrderQuantity: 5,
      unitPrice: 16000, // ₹16,000 per Ton
      origin: {
        state: 'Bihar',
        district: 'Patna',
        farmLocation: 'Rural Siding 4',
        pincode: '800001',
      },
      harvestDate: new Date('2026-09-12'),
      packagingType: 'Loose Bulk',
      description: 'High moisture grain flagged by platform sensors for elevated moisture and impurities. Useful for testing admin moderation workflows.',
      images: [],
      seller: seller3._id,
      status: 'delisted_by_admin',
      adminNotes: 'Delisted due to moisture percentage exceeding safety limit (16.5% > 14%). Requires re-drying certificate.',
    },
  ];

  const createdListings = await Listing.insertMany(sampleListings);
  console.log(`[Seed] Seeded ${createdListings.length} produce listings.`);

  // Sample Orders
  console.log('[Seed] Seeding realistic sample bulk orders across multiple fulfillment stages...');

  const sampleOrders = [
    {
      orderNumber: 'AGR-26101-101',
      buyer: buyer1._id,
      seller: seller1._id,
      listing: createdListings[0]._id, // Basmati Paddy
      commodity: 'Paddy',
      grade: 'Grade A',
      quantity: 25,
      unit: 'Metric Tons',
      unitPrice: 42000,
      totalAmount: 1050000,
      status: 'shipped',
      paymentStatus: 'escrow_hold',
      deliveryAddress: {
        street: '740 Industrial Harbor Parkway',
        city: 'Chicago',
        state: 'Illinois',
        pincode: '60607',
        contactPerson: 'David Sterling',
        contactPhone: '+1 (555) 781-6452',
      },
      deliveryNotes: 'Freight dispatched via Continental Railway Line 4. Bill of Lading #CR-984421.',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date('2026-11-10T09:00:00Z'),
          note: 'Bulk purchase order placed for 25 Metric Tons Basmati Paddy.',
          updatedBy: buyer1._id,
        },
        {
          status: 'accepted',
          timestamp: new Date('2026-11-10T14:30:00Z'),
          note: 'Seller confirmed stock reservation and moisture verification lab report.',
          updatedBy: seller1._id,
        },
        {
          status: 'processing',
          timestamp: new Date('2026-11-11T11:00:00Z'),
          note: 'Bagged into export-grade 50kg jute bags and loaded at railhead silo.',
          updatedBy: seller1._id,
        },
        {
          status: 'shipped',
          timestamp: new Date('2026-11-12T16:00:00Z'),
          note: 'Consignment departed freight terminal. Estimated arrival: 4 days.',
          updatedBy: seller1._id,
        },
      ],
    },
    {
      orderNumber: 'AGR-26102-204',
      buyer: buyer1._id,
      seller: seller2._id,
      listing: createdListings[6]._id, // Export Quality Bold Peanuts
      commodity: 'Peanuts',
      grade: 'Grade A',
      quantity: 15,
      unit: 'Metric Tons',
      unitPrice: 78000,
      totalAmount: 1170000,
      status: 'delivered',
      paymentStatus: 'paid',
      deliveryAddress: {
        street: '740 Industrial Harbor Parkway',
        city: 'Chicago',
        state: 'Illinois',
        pincode: '60607',
        contactPerson: 'David Sterling',
        contactPhone: '+1 (555) 781-6452',
      },
      deliveryNotes: 'Temperature controlled reefer transport delivered safely to warehouse bay 7.',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date('2026-11-04T10:00:00Z'),
          note: 'Bulk order initiated for 15 Metric Tons Bold Peanuts.',
          updatedBy: buyer1._id,
        },
        {
          status: 'accepted',
          timestamp: new Date('2026-11-04T12:00:00Z'),
          note: 'Accepted by Gujarat Agro cooperative.',
          updatedBy: seller2._id,
        },
        {
          status: 'shipped',
          timestamp: new Date('2026-11-05T08:00:00Z'),
          note: 'Dispatched via Express Agro Logistics.',
          updatedBy: seller2._id,
        },
        {
          status: 'delivered',
          timestamp: new Date('2026-11-08T15:00:00Z'),
          note: 'Received at Chicago food facility. Quality sample passed lab testing. Escrow released.',
          updatedBy: buyer1._id,
        },
      ],
    },
    {
      orderNumber: 'AGR-26103-311',
      buyer: buyer2._id,
      seller: seller2._id,
      listing: createdListings[3]._id, // Bright Yellow Feed Corn
      commodity: 'Corn',
      grade: 'Grade A',
      quantity: 50,
      unit: 'Metric Tons',
      unitPrice: 21500,
      totalAmount: 1075000,
      status: 'pending',
      paymentStatus: 'escrow_hold',
      deliveryAddress: {
        street: 'Industrial Sector 9',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        contactPerson: 'Priya Sharma',
        contactPhone: '+1 (555) 345-6789',
      },
      deliveryNotes: 'Awaiting seller review and logistics scheduling.',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date('2026-11-18T14:15:00Z'),
          note: 'Order placed by Heritage Rice Mills for 50 Metric Tons of high protein feed corn.',
          updatedBy: buyer2._id,
        },
      ],
    },
    {
      orderNumber: 'AGR-26104-419',
      buyer: buyer2._id,
      seller: seller1._id,
      listing: createdListings[1]._id, // Sona Masoori
      commodity: 'Paddy',
      grade: 'Grade A',
      quantity: 30,
      unit: 'Metric Tons',
      unitPrice: 28500,
      totalAmount: 855000,
      status: 'accepted',
      paymentStatus: 'escrow_hold',
      deliveryAddress: {
        street: 'Industrial Sector 9',
        city: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        contactPerson: 'Priya Sharma',
        contactPhone: '+1 (555) 345-6789',
      },
      deliveryNotes: 'Seller accepted; packing scheduled for tomorrow.',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date('2026-11-17T08:00:00Z'),
          note: 'Order submitted.',
          updatedBy: buyer2._id,
        },
        {
          status: 'accepted',
          timestamp: new Date('2026-11-17T11:00:00Z'),
          note: 'Confirmed by seller. Weighbridge allocation reserved.',
          updatedBy: seller1._id,
        },
      ],
    },
  ];

  const createdOrders = await Order.insertMany(sampleOrders);
  console.log(`[Seed] Seeded ${createdOrders.length} bulk agricultural orders.`);

  console.log('[Seed] Database successfully populated!');
  console.log('---------------------------------------------------------');
  console.log('Demo Accounts:');
  console.log('  Buyer:  buyer@agroharvest.com     / Buyer@123');
  console.log('  Seller: seller@agroharvest.com    / Seller@123');
  console.log('  Admin:  admin@agroharvest.com     / Admin@123');
  console.log('---------------------------------------------------------');
};

// Execute if run directly
const run = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('[Seed] Done. Closing connection.');
    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  run();
}
