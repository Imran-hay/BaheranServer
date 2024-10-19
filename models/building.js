var mongoose = require('mongoose');
const Contract = require('./contract');

// Define the Room schema
const roomSchema = new mongoose.Schema({
  number: {
    type: String, // Consider Number if only numeric
    required: true,
  },
  size: {
    type: Number,
    required: false,
  },
  price:{
    type: Number,
    required: true,
    default: 0,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null,
  },
});

// Define the Floor schema
const floorSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  roomCount: {
    type: Number,
    required: true,
  },
  rooms: [roomSchema],
});

// Utility function to generate rooms based on room count
const generateRooms = (roomCount, floorNumber) => {
  return Array.from({ length: roomCount }, (_, index) => ({
    number: `${floorNumber}-${index + 1}`, // Format: "1-1", "1-2", etc.
    size: null,
    renter: null,
    price: 0,
  }));
};

// Define the Building schema
const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner:{
    type: String,
    required: false,

  },
  location: {
    type: String,
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  floors: [floorSchema],
});

// Pre-save hook to generate rooms based on room counts
// Pre-save hook to generate rooms based on room counts, only for new buildings
buildingSchema.pre('save', function(next) {
  // Check if the document is new
  if (this.isNew) {
    this.floors.forEach((floor) => {
      floor.rooms = generateRooms(floor.roomCount, floor.number);
    });
  }
  next();
});

// Export the Building model
module.exports = mongoose.models.Building || mongoose.model("Building", buildingSchema);