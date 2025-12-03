
<h1 align="center">🌲 FRA Atlas</h1>
<p align="center">
  <i>Scan • Map • Act — A Complete Digital System for Forest Rights Claims</i><br>
  <b>Developed by: Prabhat Kale (CSE-AIML)</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Mapping-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/OCR-Tesseract.js-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
</p>

---

## 🔗 **Check it Out**
**Live Demo:** 


---

# 🚀 Overview

**FRA Atlas** is a modern gov-tech web application designed to digitize and streamline **Forest Rights Act (FRA) claim processing** using:

- OCR-powered document scanning  
- Interactive GIS mapping  
- Automated decision support  
- QR-based claim verification  
- Lightweight Google Sheets backend (no-code friendly)

It is built for **government departments, NGOs, survey teams, and field officers** working on FRA implementation.

---

# 🌟 Core Features

### 🔍 **Scan**
- Upload PDF/images of claims  
- Extract text using **Tesseract.js OCR**  
- Supports voice-based form filling  

### 🗺️ **Map**
- Plot claims using **React Leaflet**  
- Clustering for large datasets  
- District-level heatmaps & risk overlays  

### ⚙️ **Act**
- Auto-fill structured data  
- Generate unique QR codes for each claim  
- Automated suggestions based on NDVI/area/status  
- View detailed claim sheet with all metadata  

---

# 🛠️ Quick Start

## 1️⃣ Install Dependencies
```bash
npm install
````

## 2️⃣ Configure Backend

1. Copy `.env.example` → `.env`
2. Replace `__BACKEND_URL__` in `src/config.js` with your **Google Apps Script Web App URL**

## 3️⃣ Start Dev Server

```bash
npm run dev
```

Open **[http://localhost:8080](http://localhost:8080)**

---

# 🎥 2-Minute Demo Flow

### (Three Steps → Upload → Submit → View on Map)

1. **Landing Page**
   Clean govt-style UI with FRA Atlas branding

2. **Upload Claims**

   * Upload a claim form
   * OCR extracts fields automatically
   * Or speak:
     *“Name: Ravi Kumar, Village: Ambeli, Area: 2.5 hectares”*

3. **Map View**

   * Clustered claim points
   * District stats
   * NDVI flagging
   * QR for each claim

---

# 🔧 Backend Setup (Google Apps Script)

### Google Sheets Columns

```
id, name, village, district, area_ha, lat, lon,
status, created_at, scheme_suggestions, ndvi_flag
```

### API Endpoints

* **GET /claims** – all claims
* **POST /claims** – new claim
* **GET /claim/:id** – single claim
* **PATCH /claim/:id** – update status

---

# 🧱 Project Structure

```
src/
 ├── components/      # UI components
 ├── pages/           # Screens & flows
 ├── utils/           # Helpers
 ├── config.js        # API config
 └── index.css        # Styles & design system
```

---

# 🎨 Design System

* **Colors:**

  * Forest Green `#22C55E`
  * Warm Orange `#F97316`
* **Typography:** Inter
* **Style:**
  Rounded cards, shadow layers, gov-tech structure

---

# 📦 Dependencies

* React + TypeScript
* React Router
* React Leaflet
* Tesseract.js
* Framer Motion
* QRCode.react

---



# 📜 License

**MIT License** — Free for govt, academic & NGO use.

---
