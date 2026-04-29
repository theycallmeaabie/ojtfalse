# Retail Insights Dashboard

A data-driven web application that helps small retail businesses gain actionable insights from their transactional data. Place your sales history Excel file in the `data/` folder and the app automatically computes customer segments, surfaces top products, and recommends related items.

---

## Stack

- **Frontend** — Vanilla HTML, CSS, and JavaScript
- **Backend** — FastAPI (Python)
- **ML Pipeline** — scikit-learn (KMeans clustering, cosine similarity)

---

## Features

- **Dashboard** — Live overview of total revenue, customers, transactions, monthly revenue trend, top customers, and top products
- **RFM Analysis** — Computes Recency, Frequency, and Monetary metrics per customer
- **Customer Segmentation** — K-Means clustering groups customers into VIP, Loyal, At Risk, and Inactive segments
- **Product Recommendations** — Item-based collaborative filtering using cosine similarity; search by SKU or name and get instant matches
- **Update Data** — Drag-and-drop a new Excel or CSV file to replace the dataset without restarting the server

---

## Project Structure

```
├── backend/
│   ├── main.py            # FastAPI app, API endpoints, static file serving
│   ├── preprocessing.py   # Data cleaning and validation
│   ├── rfm.py             # RFM computation
│   ├── clustering.py      # KMeans clustering
│   └── recommender.py     # Cosine similarity recommendations
├── frontend/
│   ├── index.html         # App shell and sidebar navigation
│   ├── style.css          # All styles
│   └── app.js             # SPA routing and page logic
├── data/
│   └── Online Retail.xlsx # Dataset (read on startup)
├── diagrams/              # Architecture diagrams
├── requirements.txt
└── .venv/                 # Python virtual environment
```

---

## Running Locally

**1. Install dependencies**
```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**2. Place your data file**

Put your `Online Retail.xlsx` (or any compatible Excel/CSV) in the `data/` folder.

**3. Start the server**
```bash
cd backend
uvicorn main:app --reload
```

Open `http://localhost:8000` — the frontend is served directly by FastAPI.

---

## Data Format

The Excel or CSV file must contain these columns:

| Column | Description |
|---|---|
| `CustomerID` | Numeric customer identifier |
| `InvoiceNo` | Invoice number (rows starting with `C` are treated as cancellations and excluded) |
| `InvoiceDate` | Date/time of purchase |
| `StockCode` | Product SKU |
| `Description` | Product name |
| `Quantity` | Units purchased |
| `UnitPrice` | Price per unit |

An optional `Country` column is supported but not required.

---

## Use Cases

- Customer segmentation for targeted marketing
- Identifying high-value and at-risk customers
- Product cross-sell and bundling recommendations
- Sales performance analysis over time
