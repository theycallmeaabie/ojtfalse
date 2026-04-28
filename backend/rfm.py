import pandas as pd


def compute_rfm(df):
    """Compute Recency, Frequency, and Monetary for each customer."""
    # Use the day after the last invoice as reference date
    reference_date = df["InvoiceDate"].max() + pd.Timedelta(days=1)

    rfm = df.groupby("CustomerID").agg(
        Recency=("InvoiceDate", lambda x: (reference_date - x.max()).days),
        Frequency=("InvoiceNo", "nunique"),
        Monetary=("TotalPrice", "sum"),
    )

    rfm = rfm.reset_index()
    return rfm
