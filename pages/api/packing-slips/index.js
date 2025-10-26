import connectDB from '../../../lib/db';
import PackingSlip from '../../../models/PackingSlip';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { receiver_history } = req.query;
      
      if (receiver_history) {
        // Get receiver history - unique merchant/design combinations sent to each receiver
        const dispatchedSlips = await PackingSlip.find({
          courier: { $exists: true, $ne: null, $ne: '' },
          docNo: { $exists: true, $ne: null, $ne: '' }
        });

        const receiverHistory = {};
        dispatchedSlips.forEach(slip => {
          const receiverName = slip.receiverName;
          if (!receiverHistory[receiverName]) {
            receiverHistory[receiverName] = {
              receiverName: receiverName,
              totalPackingSlips: 0,
              combinations: {}
            };
          }
          receiverHistory[receiverName].totalPackingSlips++;
          slip.items.forEach(item => {
            const combinationKey = `${item.merchant}|${item.designNo}`;
            if (!receiverHistory[receiverName].combinations[combinationKey]) {
              receiverHistory[receiverName].combinations[combinationKey] = {
                merchant: item.merchant,
                designNo: item.designNo,
                totalPieces: 0,
                packingSlipNumbers: []
              };
            }
            receiverHistory[receiverName].combinations[combinationKey].totalPieces += item.totalPieces;
            if (!receiverHistory[receiverName].combinations[combinationKey].packingSlipNumbers.includes(slip.packingSlipNumber)) {
              receiverHistory[receiverName].combinations[combinationKey].packingSlipNumbers.push(slip.packingSlipNumber);
            }
          });
        });

        const result = Object.values(receiverHistory).map(receiver => ({
          ...receiver,
          combinations: Object.values(receiver.combinations).sort((a, b) => {
            if (a.merchant !== b.merchant) {
              return a.merchant.localeCompare(b.merchant);
            }
            return a.designNo.localeCompare(b.designNo);
          })
        })).sort((a, b) => a.receiverName.localeCompare(b.receiverName));

        res.json(result);
      } else {
        // Get all packing slips
        const packingSlips = await PackingSlip.find({}).sort({ createdAt: -1 });
        res.status(200).json(packingSlips);
      }
    } catch (error) {
      console.error('Error fetching packing slips:', error);
      res.status(500).json({ error: 'Failed to fetch packing slips' });
    }
  } else if (req.method === 'POST') {
    try {
      const { receiverName, brokerName, items, date } = req.body;

      if (!receiverName || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Generate packing slip number
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1;
      const financialYearShort = financialYear.toString().slice(-2) + (financialYear + 1).toString().slice(-2);

      const existingSlips = await PackingSlip.find({
        packingSlipNumber: { $regex: `^PS-${financialYearShort}` }
      }).sort({ packingSlipNumber: -1 });

      let nextCount = 1;
      if (existingSlips.length > 0) {
        const lastSlipNumber = existingSlips[0].packingSlipNumber;
        const lastCount = parseInt(lastSlipNumber.split('-')[1].slice(4));
        nextCount = lastCount + 1;
      }
      const packingSlipNumber = `PS-${financialYearShort}${nextCount.toString().padStart(4, '0')}`;

      const packingSlipData = {
        receiverName,
        brokerName,
        packingSlipNumber,
        date: date || new Date(),
        items
      };

      const newPackingSlip = new PackingSlip(packingSlipData);
      await newPackingSlip.save();

      res.status(201).json({
        message: 'Packing slip created successfully',
        packingSlip: newPackingSlip
      });
    } catch (error) {
      console.error('Error creating packing slip:', error);
      res.status(500).json({ error: 'Failed to create packing slip' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
