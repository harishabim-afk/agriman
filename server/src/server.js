import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { seedData } from './seed.js';
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listing.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌾 AgroHarvest API running on port ${PORT}`);
});

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Welcome endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'AgroHarvest API',
    commodities: ['Paddy', 'Corn', 'Peanuts'],
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Frontend Assets (Production/Full-stack single port)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Fallback to client index.html for SPA client-side routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[AgroHarvest Server Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is fresh
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AgroHarvest] Fresh database detected. Auto-seeding initial commodities and accounts...');
      await seedData();
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`🌾 AgroHarvest API running at http://${HOST}:${PORT}`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start AgroHarvest server:', err);
    process.exit(1);
  }
};

// Export app and startup for testing/standalone
export { app, startServer };

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
