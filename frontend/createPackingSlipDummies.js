const axios = require("axios");

const dummies = [
  {
    receiverName: "Test Receiver",
    brokerName: "Alpha Broker",
    packingSlipNumber: "PS-2526DUMMY1",
    date: "2025-12-08T00:00:00.000Z",
    items: [
      {
        srNo: 1,
        merchant: "Test Merchant",
        productionSampleType: "Paper Booklet",
        designNo: "T1001",
        totalPieces: 25
      },
      {
        srNo: 2,
        merchant: "Sample Corp",
        productionSampleType: "Hanger",
        designNo: "T1002",
        totalPieces: 40
      }
    ],
    courier: "BlueDart",
    docNo: "DOC0001"
  },
  {
    receiverName: "Acme Imports",
    brokerName: "Beta Brokers",
    packingSlipNumber: "PS-2526DUMMY2",
    date: "2025-12-09T00:00:00.000Z",
    items: [
      {
        srNo: 1,
        merchant: "Acme Corp",
        productionSampleType: "Box",
        designNo: "A2002",
        totalPieces: 10
      }
    ],
    courier: "FedEx",
    docNo: "DOC0022"
  },
  {
    receiverName: "Sample Co",
    brokerName: "Gamma Ltd",
    packingSlipNumber: "PS-2526DUMMY3",
    date: "2025-12-10T00:00:00.000Z",
    items: [
      {
        srNo: 1,
        merchant: "Gamma Inc",
        productionSampleType: "Bag",
        designNo: "G-888",
        totalPieces: 100
      },
      {
        srNo: 2,
        merchant: "Test Merchant",
        productionSampleType: "Envelope",
        designNo: "T1005",
        totalPieces: 12
      }
    ],
    courier: "DHL",
    docNo: "DOC0199"
  }
];

async function createDummies() {
  for (const slip of dummies) {
    try {
      const res = await axios.post("http://localhost:3000/api/packing-slips", slip);
      console.log("Created:", res.data.packingSlipNumber || res.data.packingSlip?.packingSlipNumber);
    } catch (err) {
      console.error("Failed to create:", slip.packingSlipNumber, "->", err.response?.data || err.message);
    }
  }
}

createDummies();
