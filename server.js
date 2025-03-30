import express from 'express';
import cors from 'cors';
import candidateRoutes from './routes/candidates.js';

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', candidateRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
