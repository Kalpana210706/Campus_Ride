const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, vehicleInfo } = req.body;

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Explicit strict manual hashing layer
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userFields = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword, // Encrypted hash goes to DB directly
            role: role || 'passenger'
        };

        if (role === 'driver') {
            if (!vehicleInfo || !vehicleInfo.vehicleNumber) {
                return res.status(400).json({ message: "Driver registration requires vehicle details" });
            }
            userFields.vehicleInfo = {
                vehicleType: vehicleInfo.vehicleType || 'E-Rickshaw',
                vehicleNumber: vehicleInfo.vehicleNumber
            };
        }

        const user = await User.create(userFields);

        res.status(201).json({
            message: "User registered successfully!",
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        res.status(500).json({ error: error.message, message: "Server registry internal conflict" });
    }
};

// 2. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials (Email not found)" });
        }

        // Pure node-level direct bcrypt comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials (Password mismatch)" });
        }

        res.json({
            message: "Login successful",
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 3. UPDATE AVAILABILITY STATUS
exports.updateAvailability = async (req, res) => {
    try {
        const { isOnline } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { isOnline }, { new: true }).select('-password');
        res.json({ message: `Driver status updated to ${isOnline ? 'Online' : 'Offline'}`, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};