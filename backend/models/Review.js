const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedbackText: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);