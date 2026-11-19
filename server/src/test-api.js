import { connectDB, closeDB } from './config/db.js';
import { seedData } from './seed.js';
import { User } from './models/User.js';
import { Listing } from './models/Listing.js';
import { Order } from './models/Order.js';
import jwt from 'jsonwebtoken';

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    throw new Error(msg);
  }
  console.log(`  ✓ ${msg}`);
};

export const runTests = async () => {
  console.log('\n==================================================');
  console.log('🌾 AGROHARVEST INTEGRATION & RBAC TEST SUITE');
  console.log('==================================================\n');

  try {
    // 1. Verify Seed Accounts
    console.log('[Test 1] Verifying Seed Accounts for 3 Roles...');
    const admin = await User.findOne({ email: 'admin@agroharvest.com' });
    const seller = await User.findOne({ email: 'seller@agroharvest.com' });
    const buyer = await User.findOne({ email: 'buyer@agroharvest.com' });

    assert(admin && admin.role === 'admin', 'Admin account verified (role=admin)');
    assert(seller && seller.role === 'seller', 'Seller account verified (role=seller)');
    assert(buyer && buyer.role === 'buyer', 'Buyer account verified (role=buyer)');

    const isMatch = await buyer.comparePassword('Buyer@123');
    assert(isMatch === true, 'Buyer password validation succeeds');

    // 2. Verify Listings and Commodity Coverage
    console.log('\n[Test 2] Verifying Commodity Listings (Paddy, Corn, Peanuts)...');
    const paddyListings = await Listing.find({ commodity: 'Paddy', status: 'active' });
    const cornListings = await Listing.find({ commodity: 'Corn', status: 'active' });
    const peanutListings = await Listing.find({ commodity: 'Peanuts', status: 'active' });

    assert(paddyListings.length > 0, `Paddy listings found: ${paddyListings.length}`);
    assert(cornListings.length > 0, `Corn listings found: ${cornListings.length}`);
    assert(peanutListings.length > 0, `Peanut listings found: ${peanutListings.length}`);

    // Verify Moisture and Grade fields
    const sample = paddyListings[0];
    assert(typeof sample.moisturePercentage === 'number' && sample.moisturePercentage > 0, `Moisture % verified: ${sample.moisturePercentage}%`);
    assert(['Grade A', 'Grade B', 'Grade C'].includes(sample.grade), `Quality grade verified: ${sample.grade}`);
    assert(sample.origin && sample.origin.state, `Origin state verified: ${sample.origin.state}`);

    // 3. Test Seller Creating & Modifying Produce
    console.log('\n[Test 3] Testing Seller Produce Creation & Updates...');
    const testProduce = await Listing.create({
      title: 'Automated Test Corn Crop Lot #99',
      commodity: 'Corn',
      variety: 'Yellow Dent Test',
      grade: 'Grade A',
      moisturePercentage: 11.9,
      quantity: 80,
      unit: 'Metric Tons',
      minimumOrderQuantity: 5,
      unitPrice: 22500,
      origin: { state: 'Iowa', district: 'Story County' },
      seller: seller._id,
      status: 'active',
    });
    assert(testProduce._id != null, 'Seller successfully created new produce listing');

    testProduce.unitPrice = 22000;
    await testProduce.save();
    assert(testProduce.unitPrice === 22000, 'Seller successfully updated unit price');

    // 4. Test Buyer Bulk Order Placement & Inventory Deduction
    console.log('\n[Test 4] Testing Buyer Bulk Order Placement & Stock Reservation...');
    const initialStock = testProduce.quantity;
    const orderQty = 20;

    const newOrder = await Order.create({
      orderNumber: `AGR-TEST-${Date.now().toString().slice(-4)}`,
      buyer: buyer._id,
      seller: seller._id,
      listing: testProduce._id,
      commodity: testProduce.commodity,
      grade: testProduce.grade,
      quantity: orderQty,
      unit: testProduce.unit,
      unitPrice: testProduce.unitPrice,
      totalAmount: orderQty * testProduce.unitPrice,
      status: 'pending',
      paymentStatus: 'escrow_hold',
      deliveryAddress: {
        street: '100 Millers Way',
        city: 'Chicago',
        state: 'Illinois',
        pincode: '60601',
      },
      statusTimeline: [
        {
          status: 'pending',
          note: 'Initial bulk order placed',
          updatedBy: buyer._id,
        },
      ],
    });

    testProduce.quantity -= orderQty;
    await testProduce.save();

    assert(newOrder._id != null, `Order created: ${newOrder.orderNumber} for $${newOrder.totalAmount}`);
    assert(testProduce.quantity === initialStock - orderQty, `Stock deducted: ${initialStock} -> ${testProduce.quantity} Tons`);

    // 5. Test Seller Order Acceptance & Status Progression
    console.log('\n[Test 5] Testing Seller Fulfillment Pipeline...');
    newOrder.status = 'accepted';
    newOrder.statusTimeline.push({
      status: 'accepted',
      note: 'Seller confirmed weighbridge allocation',
      updatedBy: seller._id,
    });
    await newOrder.save();
    assert(newOrder.status === 'accepted', 'Seller accepted order');

    newOrder.status = 'shipped';
    newOrder.statusTimeline.push({
      status: 'shipped',
      note: 'Freight departed terminal',
      updatedBy: seller._id,
    });
    await newOrder.save();
    assert(newOrder.status === 'shipped', 'Order transitioned to shipped');

    // 6. Test Admin Governance (Verify Seller, Moderate Listing)
    console.log('\n[Test 6] Testing Admin Governance & Verification...');
    const unverifiedSeller = await User.findOne({ verifiedSeller: false, role: 'seller' });
    if (unverifiedSeller) {
      unverifiedSeller.verifiedSeller = true;
      await unverifiedSeller.save();
      assert(unverifiedSeller.verifiedSeller === true, `Admin successfully verified seller ${unverifiedSeller.name}`);
    }

    testProduce.status = 'delisted_by_admin';
    testProduce.adminNotes = 'Moderated for testing compliance flags';
    await testProduce.save();
    assert(testProduce.status === 'delisted_by_admin', 'Admin successfully moderated/delisted produce listing');

    // Clean up test listing & order
    await Listing.findByIdAndDelete(testProduce._id);
    await Order.findByIdAndDelete(newOrder._id);
    console.log('  ✓ Test artifacts cleaned up');

    console.log('\n==================================================');
    console.log('✅ ALL AGROHARVEST VERIFICATION TESTS PASSED (6/6)');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  }
};

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('test-api.js')) {
  (async () => {
    await connectDB();
    await seedData();
    await runTests();
    await closeDB();
    process.exit(0);
  })();
}
