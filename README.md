# Allen Jorgio - Textile Sample Management System

A comprehensive MERN stack web application for Allen Jorgio textile manufacturing company to manage sample records with QR code integration, inventory tracking, and automated packing slip generation.

## 🚀 Features

### Core Functionality
- **Sample Entry Management**: Create and manage textile samples with automatic QR code generation
- **Real-time Stock Tracking**: View aggregated inventory levels and stock status
- **Packing Slip Generation**: Create packing slips with QR code scanning capability
- **QR Code Management**: Browse, search, and download QR codes for all samples
- **PDF Export**: Generate printable packing slips in PDF format

### Technical Features
- **QR Code Integration**: Automatic QR code generation for each sample entry
- **Real-time Updates**: Live inventory tracking with automatic aggregation
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Smooth Animations**: Enhanced UX with Framer Motion animations
- **Search & Filter**: Advanced filtering and search capabilities

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **QR Code Generation** using qrcode library
- **PDF Generation** using jsPDF and jsPDF-autotable

### Frontend
- **React** with TypeScript
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls
- **QRCode.react** for QR code display

## 📁 Project Structure

```
textile-sample-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── Sample.js             # Sample schema
│   │   └── PackingSlip.js        # Packing slip schema
│   ├── routes/
│   │   ├── samples.js            # Sample API endpoints
│   │   └── packingSlips.js       # Packing slip API endpoints
│   └── server.js                 # Express server
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx        # Navigation component
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Home page
│   │   │   ├── CreateSample.tsx  # Sample creation form
│   │   │   ├── StockStatus.tsx   # Stock status page
│   │   │   ├── CreatePackingSlip.tsx # Packing slip form
│   │   │   └── ViewQRs.tsx       # QR code viewer
│   │   ├── services/
│   │   │   └── api.ts            # API service layer
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   └── App.tsx               # Main app component
│   └── package.json
├── package.json                  # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd textile-sample-management
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/textile_samples
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually
   npm run server    # Backend only
   npm run client    # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Database Schema

### Sample Collection
```javascript
{
  merchant: String (required),
  productionSampleType: String (required), // A, B, C, D, etc.
  designNo: String (required), // A1, A2, etc.
  pieces: Number (required),
  dateCreated: Date (default: Date.now),
  qrCodeId: String (unique)
}
```

### Packing Slip Collection
```javascript
{
  distributorName: String (required),
  brokerName: String,
  chalanNumber: String (required),
  date: Date (default: Date.now),
  courierNumber: String,
  courierProvider: String,
  items: [{
    srNo: Number,
    merchant: String,
    productionSampleType: String,
    designNo: String,
    totalPieces: Number
  }]
}
```

## 🔌 API Endpoints

### Samples
- `POST /api/samples` - Create new sample(s)
- `GET /api/samples` - Get all samples
- `GET /api/samples/:id` - Get sample by ID
- `GET /api/samples/qr/:qrCodeId` - Get sample by QR code ID
- `GET /api/samples/by-date/:date` - Filter samples by date
- `GET /api/samples/aggregate/stock` - Get stock summary
- `PUT /api/samples/:id` - Update sample
- `DELETE /api/samples/:id` - Delete sample

### Packing Slips
- `POST /api/packing-slips` - Create packing slip
- `GET /api/packing-slips` - Get all packing slips
- `GET /api/packing-slips/:id` - Get packing slip by ID
- `GET /api/packing-slips/:id/pdf` - Download PDF
- `PUT /api/packing-slips/:id` - Update packing slip
- `DELETE /api/packing-slips/:id` - Delete packing slip

## 🎯 Usage Guide

### 1. Create Sample Entry
- Navigate to "Create Sample Entry"
- Fill in merchant, sample type, design number, and pieces
- Add multiple entries before submitting
- QR codes are automatically generated and displayed

### 2. View Stock Status
- Check "Current Stock Status" for inventory overview
- Use filters to view specific merchants or date ranges
- View aggregated stock levels by sample type and design

### 3. Create Packing Slip
- Go to "Create Packing Slip"
- Fill in distributor and courier information
- Scan QR codes or manually add items
- Generate and download PDF packing slip

### 4. Manage QR Codes
- Visit "View Sample QRs" to browse all QR codes
- Search by design number, sample type, or merchant
- Download individual QR codes or view detailed information

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Frontend Configuration
- API base URL can be configured in `frontend/src/services/api.ts`
- Default: `http://localhost:5000/api`

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

### Frontend Deployment
1. Navigate to frontend directory: `cd frontend`
2. Build the React app: `npm run build`
3. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for Allen Jorgio textile manufacturing efficiency**
