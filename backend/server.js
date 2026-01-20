const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes=require('./routes/auth');
const protectedRoutes=require('./routes/protected');
const roleProtectedRoutes=require('./routes/roleProtected');
const jobRoutes=require('./routes/job');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth',authRoutes);
app.use('/api/protected',protectedRoutes);
app.use('/api/role',roleProtectedRoutes);
app.use('/api/jobs',jobRoutes);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB connection error:", err));
app.get('/', (req, res) => {
    res.send("Way to Jobs Backend Running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
