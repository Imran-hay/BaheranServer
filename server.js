
require('./config/db').connect()
const express = require('express'); // If using Express
const cors = require('cors');
const { addMonths, format, isAfter } = require('date-fns');
const Contract = require('./models/contract');
const Building = require('./models/building');
const http = require('http');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
    origin: [
        'https://baheran-rentals-swiv.vercel.app', // Production URL
        'http://localhost:3000' // Localhost
    ],
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials if needed
};

// Enable CORS
app.use(cors(corsOptions));

// Set up Socket.IO
const io = require("socket.io")(server, {
    cors: corsOptions, // Use the same options
});

// Set up an event listener for new client connections
io.on('connection', (socket) => {
    console.log("User connected!");

    const checkConditionAndNotify = async () => {
        const role = socket.handshake.query.role; // Access the userId parameter
        const id = socket.handshake.query.id; // Access the userId parameter
        console.log(`Role: ${role}`);

        const data = await updateExpiredContracts(role, id);
        const data2 = await findUnpaidContracts(role, id);

        console.log(data);
        console.log(data2);

        const conditionIsTrue = data.status;
        const conditionIsTrue2 = data2.status;

        if (conditionIsTrue) {
            io.emit("notifyExpiration", `Contract Expiration for ${data.data.join(', ')}`);
        }

        if (conditionIsTrue2) {
            io.emit("notifyUnpaid", `Unpaid Contracts for ${data2.data.join(', ')}`);
        }
    };

    const intervalId = setInterval(checkConditionAndNotify, 12 * 60 * 60 * 1000); // Check every 12 hour

    socket.on("disconnect", () => {
        console.log("User disconnected!");
        clearInterval(intervalId);
    });
});

const updateExpiredContracts = async (role,id) => {
    try {

      let contracts = null

      if(role == "super")
      {
         contracts = await Contract.find({
          status: { $in: ['Approved', 'Pending'] }
        });

      }

      else
      {
         contracts = await Contract.find({
          status: { $in: ['Approved', 'Pending'] },
          writtenBy:id
        });
      }
    
  
      // Fetch contracts in Approved or Pending state
    

      console.log(contracts)
  
      const expiredContractsIds = [];
  
      // Current date
      const currentDate = new Date();
  
      // Update the status of contracts if needed
      for (const contract of contracts) {
        const lastPaidDate = contract.payments.length > 0 ? contract.payments[0].lastpaid : null;
  
        if (lastPaidDate) {
          const expirationDate = addMonths(new Date(lastPaidDate), contract.contractLength);
  
          // Compare current date and expiration date
          if (isAfter(currentDate, expirationDate)) {
            // Update the contract status to 'Expired'
            contract.status = 'Expired';
            await contract.save(); // Save the updated contract
            //////////////////////////////////////////////////////////////////////////////////////////
            if (contract.roomNumbers && contract.roomNumbers.length > 0) {
              const updateResult = await Building.updateMany(
                  { _id: contract.buildingId, 'floors.rooms.number': { $in: contract.roomNumbers } },
                  { $set: { 'floors.$[].rooms.$[room].renter': null } },
                  { arrayFilters: [{ 'room.number': { $in: contract.roomNumbers } }] }
              );
    
              // Check if any rooms were updated
              if (updateResult.modifiedCount > 0) {
                  console.log('Rooms updated successfully');
              } else {
                  console.warn('No rooms were updated. Check room numbers or building ID.');
              
              }
          } else {
              console.warn('No room numbers provided for update');
         
          }


            ////////////////////////////////////////////////////////////////////////////////////////
            expiredContractsIds.push(contract.contractId); // Store the contract ID
          }
        }
      }
  
      // Prepare the response
      const response = {
        status: expiredContractsIds.length > 0,
        data: expiredContractsIds,
      };
  
      return response;
    } catch (error) {
      console.error('Error updating contracts:', error);
      return {
        status: false,
        data: [],
      };
    } finally {

    }
  };


  async function findUnpaidContracts(role,id) {
    try {
      // Get the current date
      const currentDate = new Date();

      let contracts = null
  
      // Find contracts that are in Pending or Approved state
      if(role == "super")
      {
         contracts = await Contract.find({
          status: { $in: ['Pending', 'Approved'] },
        });
    

      }

      else
      {
         contracts = await Contract.find({
          status: { $in: ['Pending', 'Approved'] },
          writtenBy:id
        });
      }
  
      // Array to hold contract IDs that meet the criteria
      const expiredContractIds = [];
  
      // Iterate through each contract
      contracts.forEach(contract => {
        // Check if the payments array exists and has at least one entry
        if (contract.payments && contract.payments.length > 0) {
          const lastPayment = contract.payments[contract.payments.length - 1]; // Access the last payment
          
          // Check if the current date is greater than the due date of the last payment
          if (lastPayment.duedate && currentDate > lastPayment.duedate) {
            expiredContractIds.push(contract.contractId); // Append the contract ID to the array
          }
        }
      });
  
      // Return the result
      return {
        status: expiredContractIds.length > 0, // true if there are expired contracts
        data: expiredContractIds, // Array of expired contract IDs
      };
    } catch (error) {
      console.error('Error occurred while finding expired contracts:', error);
      throw error; // Rethrow or handle the error as needed
    }
  }

setInterval(async () => {

  try {
    const result = await updateExpiredContracts("super","");
    console.log("heheh")
    
  } catch (error) {
    console.error('Error occurred while updating contracts:', error);
    throw error; // Rethrow or handle the error as needed
    
  }
  

    //console.log(result);
  
}, 21600000); // 6 hours



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});