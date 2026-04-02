// Quick database connection test
require('dotenv').config();
const mongoose = require('mongoose');
const Buyer = require('./models/Buyer');
const Farmer = require('./models/Farmer');

async function testDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/farmbid_db');
    console.log('✅ Connected to MongoDB');

    // Show connection info
    console.log('📊 Database:', mongoose.connection.name);

    // Count documents
    const buyerCount = await Buyer.countDocuments();
    const farmerCount = await Farmer.countDocuments();

    console.log(`\n📈 Document counts:`);
    console.log(`  Buyers: ${buyerCount}`);
    console.log(`  Farmers: ${farmerCount}`);

    // Find demo buyer
    const demoBuyer = await Buyer.findOne({ email: process.env.DEMO_BUYER_EMAIL || 'demo.buyer@farmbid.com' });
    if (demoBuyer) {
      console.log(`\n✅ Demo Buyer found:`);
      console.log(`  Name: ${demoBuyer.name}`);
      console.log(`  Email: ${demoBuyer.email}`);
      console.log(`  Is Demo: ${demoBuyer.isDemo}`);
      console.log(`  Has Password: ${!!demoBuyer.password}`);
      console.log(`  Role: ${demoBuyer.role}`);
      console.log(`  Wallet: ₹${demoBuyer.walletBalance}`);
    } else {
      console.log(`\n❌ Demo buyer NOT found (email: ${process.env.DEMO_BUYER_EMAIL || 'demo.buyer@farmbid.com'})`);
    }

    // Find demo farmer
    const demoFarmer = await Farmer.findOne({ email: process.env.DEMO_FARMER_EMAIL || 'demo.farmer@farmbid.com' });
    if (demoFarmer) {
      console.log(`\n✅ Demo Farmer found:`);
      console.log(`  Name: ${demoFarmer.name}`);
      console.log(`  Email: ${demoFarmer.email}`);
      console.log(`  Is Demo: ${demoFarmer.isDemo}`);
      console.log(`  Has Password: ${!!demoFarmer.password}`);
      console.log(`  Role: ${demoFarmer.role}`);
    } else {
      console.log(`\n❌ Demo farmer NOT found (email: ${process.env.DEMO_FARMER_EMAIL || 'demo.farmer@farmbid.com'})`);
    }

    // List all buyers (just names)
    console.log('\n📋 All Buyers:');
    const allBuyers = await Buyer.find().select('name email code isDemo').lean();
    allBuyers.forEach(b => console.log(`  - ${b.name} (${b.email}) [${b.code}] isDemo:${b.isDemo}`));

    // List all farmers
    console.log('\n👨‍🌾 All Farmers:');
    const allFarmers = await Farmer.find().select('name email code isDemo').lean();
    allFarmers.forEach(f => console.log(`  - ${f.name} (${f.email}) [${f.code}] isDemo:${f.isDemo}`));

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testDB();
