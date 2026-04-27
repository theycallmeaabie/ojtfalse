# Retail Insights Dashboard

A data-driven web application that helps small retail businesses gain actionable insights from their transactional data. Upload your sales history or enter records manually, and the app will compute customer segments, surface top products, and recommend related items.

## Stack

- **Frontend** — React + Vite + Tailwind CSS + Recharts
- **Backend** — FastAPI (Python)
- **Database** — SQLite (via SQLAlchemy-free raw sqlite3)
- **ML Pipeline** — scikit-learn (KMeans clustering, cosine similarity)

---

## Features

* Data Preprocessing
  Cleans raw transactional data, removes missing values, cancellations, and invalid entries, and creates derived features like TotalPrice.

* RFM Analysis
  Computes Recency, Frequency, and Monetary metrics to understand customer behavior.

* Customer Segmentation
  Uses K-Means clustering on RFM features to group customers into meaningful segments.

* Product Recommendation System
  Implements item-based collaborative filtering to suggest related products.

* Interactive Dashboard
  Built using Streamlit to display key insights such as revenue, top customers, top products, and recommendations.

---

## Project Structure

```text
├── data/
│   └── Online Retail.xlsx
├── src/
│   ├── preprocessing.py
│   ├── rfm.py
│   ├── clustering.py
│   └── recommender.py
├── app_ui.py
├── check_silhouette.py
├── requirements.txt
└── README.md
```

---

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv .venv
```

### 2. Activate Environment

Linux / Mac:

```bash
source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Running the Application

**Backend**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Clustering Evaluation

To evaluate clustering quality:

```bash
python check_silhouette.py
```

The silhouette score measures how well the clusters are separated.

---

## Technologies Used

* Python
* Pandas
* Scikit-learn
* Streamlit
* OpenPyXL

---

## Use Cases

* Customer segmentation for targeted marketing
* Identifying high-value customers
* Product recommendation and bundling
* Sales performance analysis

---

## Summary

This project demonstrates how raw transactional data can be transformed into meaningful business insights using simple and efficient techniques.
