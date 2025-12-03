# FRA Atlas - Scan • Map • Act

Forest Rights Atlas - A comprehensive web application for digitizing forest rights claims with OCR scanning, interactive mapping, and automated decision support systems.

## 🚀 Features

- **Scan**: OCR-powered document scanning with Tesseract.js
- **Map**: Interactive mapping with React Leaflet and clustering
- **Act**: Automated decision support and QR code generation

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend
1. Copy `.env.example` to `.env`
2. Replace `__BACKEND_URL__` in `src/config.js` with your Google Apps Script Web App URL

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the application.

## 📱 2-Minute Demo Script

### Demo Flow (3 clicks: Upload → Submit → See Map + QR)

1. **Landing Page**: Show hero section with FRA Atlas branding
2. **Upload Claims**: 
   - Upload a forest rights document (PDF/image)
   - Watch OCR extract data automatically
   - Or use voice input: "Name: Ravi Kumar, Village: Ambeli, District: Udaipur, Area: 2.5 hectares"
3. **View on Map**: See claims plotted with clustering, risk overlays, and district statistics
4. **Claim Details**: Click marker to see QR code and decision support suggestions

### Key Demo Points
- **No-code friendly**: Connects directly to Google Sheets backend
- **Government-ready**: Clean, accessible design following gov-tech standards
- **Mobile responsive**: Works on tablets and phones for field use

## 🔧 Backend Setup

### Google Apps Script Configuration

1. Create a new Google Apps Script project
2. Set up a Google Sheet with columns: `id`, `name`, `village`, `district`, `area_ha`, `lat`, `lon`, `status`, `created_at`, `scheme_suggestions`, `ndvi_flag`
3. Deploy as Web App with permissions for anonymous access
4. Update `BACKEND_URL` in `src/config.js`

### Expected API Endpoints

- `GET /claims` - Returns array of all claims
- `POST /claims` - Submit new claim (JSON body)
- `GET /claim/:id` - Get single claim by ID
- `PATCH /claim/:id` - Update claim status

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── utils/              # Utility functions
├── config.js           # Configuration settings
└── index.css           # Design system & styles
```

## 🎨 Design System

- **Colors**: Forest green primary (#22C55E), warm orange accent (#F97316)
- **Typography**: Inter font for clean readability
- **Style**: Government-tech aesthetic with rounded cards and subtle shadows

## 📦 Dependencies

- React + TypeScript
- React Router for navigation
- React Leaflet for mapping
- Tesseract.js for OCR
- QRCode.react for QR generation
- Framer Motion for animations

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Update environment variables in Vercel dashboard
4. Deploy

### Netlify Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Update environment variables
4. Deploy

## 📄 License

MIT License - Built for government and NGO use in forest rights management.