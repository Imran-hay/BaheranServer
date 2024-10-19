const mongoose = require('mongoose');
const Contract = require('./models/contract'); // Adjust the path as necessary

require('./config/db').connect()

async function findContractsWithinDueDateRange(startDate, endDate) {
  try {
    // Fetch all contracts
    const contracts = await Contract.find({
        status: { $in: ['Approved'] }
      }); //// ALE replace this with contracts you get from the database

    // Array to hold contracts with payments within the specified date range
    const matchingContracts = [];

    // Iterate through each contract
    contracts.forEach(contract => {
      // Check if the payments array exists and has entries
      if (contract.payments && contract.payments.length > 0) {
        const lastPayment = contract.payments[contract.payments.length - 1]; // Access the last payment

        // Check if the last payment's due date is within the specified range
        if (lastPayment.duedate && lastPayment.duedate >= startDate && lastPayment.duedate <= endDate) {
          matchingContracts.push(contract); // Append the contract to the array
        }
      }
    });

    // Return the matched contracts
    return matchingContracts;
  } catch (error) {
    console.error('Error occurred while finding contracts:', error);
    throw error; // Rethrow or handle the error as needed
  }
}

(async () => {
    // Define the start and end dates for the search
    const startDate = new Date('2023-10-01'); // Example start date
    const endDate = new Date('2024-12-30');   // Example end date
  
    try {
      const contractsInRange = await findContractsWithinDueDateRange(startDate, endDate);
      console.log('Contracts with payments due within the date range:', contractsInRange);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  })();


