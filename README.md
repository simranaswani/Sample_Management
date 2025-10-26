# Sample Management System

A Next.js application for managing textile samples with QR code integration, inventory tracking, and automated packing slip generation.

## Features

- **Sample Management**: Create and manage textile samples with QR code generation
- **Stock Status**: View aggregated stock levels and inventory status
- **Packing Slips**: Generate packing slips with QR code scanning
- **Receiver History**: Track unique merchant and design combinations sent to receivers
- **QR Code Scanner**: Real-time QR code scanning for packing slip creation

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Styling**: Custom CSS with Tailwind-like utilities
- **QR Codes**: qrcode.react, @zxing/browser
- **Animations**: Framer Motion

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://simranaswani4292_db_user:<fRz4HrcnpPjFa6Gf>@samplemanagementcluster.crgxmmt.mongodb.net/?retryWrites=true&w=majority&appName=SampleManagementCluster
```

### 3. Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Production Build

```bash
npm run build
npm start
```

## Deployment on Vercel

### 1. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Select the `frontend` folder as the root directory

### 2. Environment Variables

In Vercel dashboard, add the environment variable:

- `MONGODB_URI`: Your MongoDB Atlas connection string

### 3. Deploy

Vercel will automatically deploy your application. The API routes will be available at:

- `/api/health` - Health check
- `/api/samples` - Sample management
- `/api/packing-slips` - Packing slip management

## API Endpoints

### Samples
- `GET /api/samples` - Get all samples
- `POST /api/samples` - Create sample(s)

### Packing Slips
- `GET /api/packing-slips` - Get all packing slips
- `GET /api/packing-slips?receiver_history=true` - Get receiver history
- `POST /api/packing-slips` - Create packing slip
- `GET /api/packing-slips/[id]` - Get packing slip by ID
- `PUT /api/packing-slips/[id]` - Update packing slip
- `DELETE /api/packing-slips/[id]` - Delete packing slip

## Database Schema

### Sample
```javascript
{
  merchant: String,
  productionSampleType: String,
  designNo: String,
  pieces: Number,
  dateCreated: Date,
  qrCodeId: String (unique)
}
```

### PackingSlip
```javascript
{
  receiverName: String,
  brokerName: String,
  packingSlipNumber: String,
  date: Date,
  courier: String,
  docNo: String,
  items: [{
    srNo: Number,
    merchant: String,
    productionSampleType: String,
    designNo: String,
    totalPieces: Number
  }]
}
```

## Features Overview

### 1. Sample Management
- Create new samples with automatic QR code generation
- View all samples with search and filter capabilities
- Generate QR codes for printing

### 2. Stock Status
- View aggregated stock levels by merchant and design
- Filter by merchant, design number, and date range
- Export data to CSV

### 3. Packing Slip Management
- Create packing slips with automatic numbering (PS-YYYYXXXX format)
- QR code scanning for quick item addition
- PDF generation for packing slips
- Dispatch tracking with courier and document numbers

### 4. Receiver History
- Track unique merchant/design combinations sent to each receiver
- View detailed packing slip information
- Export receiver history to PDF

## QR Code Format

QR codes contain JSON data with the following structure:
```json
{
  "merchant": "MERCHANT_NAME",
  "productionSampleType": "SAMPLE_TYPE",
  "designNo": "DESIGN_NUMBER",
  "qrCodeId": "UNIQUE_ID"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Allen Jorgio textile manufacturing.