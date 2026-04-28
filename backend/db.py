import sqlite3
import pandas as pd
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "retail.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id  INTEGER NOT NULL,
            invoice_no   TEXT NOT NULL,
            invoice_date TEXT NOT NULL,
            stock_code   TEXT NOT NULL,
            description  TEXT,
            quantity     INTEGER NOT NULL,
            unit_price   REAL NOT NULL,
            total_price  REAL NOT NULL,
            country      TEXT,
            created_at   TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def load_dataframe():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM transactions", conn)
    conn.close()
    if df.empty:
        return df
    df["InvoiceDate"] = pd.to_datetime(df["invoice_date"])
    df = df.rename(columns={
        "customer_id": "CustomerID",
        "invoice_no":  "InvoiceNo",
        "stock_code":  "StockCode",
        "description": "Description",
        "quantity":    "Quantity",
        "unit_price":  "UnitPrice",
        "total_price": "TotalPrice",
        "country":     "Country",
    })
    return df


def insert_dataframe(df):
    conn = get_connection()
    rows = df[["CustomerID", "InvoiceNo", "InvoiceDate", "StockCode",
               "Description", "Quantity", "UnitPrice", "TotalPrice", "Country"]].copy()
    rows["InvoiceDate"] = rows["InvoiceDate"].astype(str)
    rows = rows.rename(columns={
        "CustomerID":  "customer_id",
        "InvoiceNo":   "invoice_no",
        "InvoiceDate": "invoice_date",
        "StockCode":   "stock_code",
        "Description": "description",
        "Quantity":    "quantity",
        "UnitPrice":   "unit_price",
        "TotalPrice":  "total_price",
        "Country":     "country",
    })
    rows.to_sql("transactions", conn, if_exists="append", index=False)
    conn.commit()
    conn.close()
    return len(rows)


def insert_transaction(customer_id, invoice_no, invoice_date, stock_code,
                       description, quantity, unit_price, country=""):
    total_price = round(quantity * unit_price, 2)
    conn = get_connection()
    conn.execute("""
        INSERT INTO transactions
            (customer_id, invoice_no, invoice_date, stock_code,
             description, quantity, unit_price, total_price, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (customer_id, invoice_no, invoice_date, stock_code,
          description, quantity, unit_price, total_price, country))
    conn.commit()
    conn.close()
