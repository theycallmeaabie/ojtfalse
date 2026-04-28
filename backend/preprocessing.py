import pandas as pd

REQUIRED_COLUMNS = {"CustomerID", "InvoiceNo", "InvoiceDate", "StockCode",
                    "Description", "Quantity", "UnitPrice"}


def clean_dataframe(df):
    """Validate and clean an uploaded DataFrame. Raises ValueError on missing columns."""
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")

    df = df.dropna(subset=["CustomerID"])
    df["CustomerID"] = df["CustomerID"].astype(int)
    df = df[~df["InvoiceNo"].astype(str).str.startswith("C")]
    df = df[df["Quantity"] > 0]
    df = df[df["UnitPrice"] > 0]
    df["InvoiceDate"] = pd.to_datetime(df["InvoiceDate"])
    df["TotalPrice"] = df["Quantity"] * df["UnitPrice"]

    if "Country" not in df.columns:
        df["Country"] = ""

    return df.reset_index(drop=True)
