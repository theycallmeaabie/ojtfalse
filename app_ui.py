import streamlit as st
import pandas as pd
import altair as alt

from src.preprocessing import load_and_clean_data
from src.rfm import compute_rfm
from src.clustering import add_clusters
from src.recommender import build_item_matrix, get_recommendations

# --- Page config ---
st.set_page_config(page_title="Retail Insights Dashboard", layout="wide")

# --- Load and process data (cached so it only runs once) ---
@st.cache_data
def load_data():
    df = load_and_clean_data()
    rfm = compute_rfm(df)
    rfm = add_clusters(rfm)
    matrix = build_item_matrix(df)
    return df, rfm, matrix

df, rfm, matrix = load_data()

# Color palette
RED = "#E74C3C"
BLUE = "#2E86C1"
YELLOW = "#F1C40F"
COLORS = [RED, BLUE, YELLOW, "#2ECC71"]  # 4 colors for 4 clusters

# --- Title ---
st.title("📊 Retail Insights Dashboard")
st.markdown("---")

# --- Overview metrics ---
st.subheader("Overview")
col1, col2, col3 = st.columns(3)
col1.metric("💰 Total Revenue", f"${df['TotalPrice'].sum():,.2f}")
col2.metric("👥 Total Customers", f"{df['CustomerID'].nunique():,}")
col3.metric("🧾 Total Transactions", f"{df['InvoiceNo'].nunique():,}")

st.markdown("---")

# --- Monthly Revenue Trend ---
st.subheader("Monthly Revenue Trend")
monthly = df.groupby(df["InvoiceDate"].dt.to_period("M"))["TotalPrice"].sum().reset_index()
monthly["InvoiceDate"] = monthly["InvoiceDate"].astype(str)
monthly.columns = ["Month", "Revenue"]

chart_revenue = (
    alt.Chart(monthly)
    .mark_area(opacity=0.7, color=BLUE, line={"color": BLUE})
    .encode(
        x=alt.X("Month:N", title="Month", axis=alt.Axis(labelAngle=0)),
        y=alt.Y("Revenue:Q", title="Revenue ($)", axis=alt.Axis(labelAngle=0)),
        tooltip=["Month", alt.Tooltip("Revenue:Q", format=",.2f")],
    )
    .properties(height=300)
)
st.altair_chart(chart_revenue, use_container_width=True)

st.markdown("---")

# --- Recommendations ---
st.subheader("🔍 Product Recommendations")

# Build a list of products with their descriptions for the dropdown
product_map = df.drop_duplicates("StockCode").set_index("StockCode")["Description"].to_dict()
product_options = {f"{code} - {desc}": code for code, desc in sorted(product_map.items(), key=lambda x: str(x[1]))}

selected_label = st.selectbox("Select a product", list(product_options.keys()))

if st.button("Recommend"):
    selected_code = product_options[selected_label]
    recs = get_recommendations(matrix, selected_code, top_n=5)

    if recs:
        rec_df = pd.DataFrame(recs, columns=["StockCode", "Similarity"])
        rec_df["Product"] = rec_df["StockCode"].map(product_map).fillna("Unknown")
        rec_df = rec_df[["StockCode", "Product", "Similarity"]]
        rec_df.index = rec_df.index + 1

        # Show table and similarity bar chart
        col_left, col_right = st.columns(2)

        with col_left:
            st.dataframe(rec_df, use_container_width=True)

        with col_right:
            chart_recs = (
                alt.Chart(rec_df)
                .mark_bar(cornerRadiusTopRight=4, cornerRadiusBottomRight=4)
                .encode(
                    y=alt.Y("Product:N", sort="-x", title="", axis=alt.Axis(labelAngle=0)),
                    x=alt.X("Similarity:Q", title="Similarity Score", axis=alt.Axis(labelAngle=0)),
                    color=alt.value(BLUE),
                    tooltip=["Product", "Similarity"],
                )
                .properties(height=250)
            )
            st.altair_chart(chart_recs, use_container_width=True)
    else:
        st.warning("No recommendations found for this product.")

st.markdown("---")

# --- Customer Segments (table + bar chart) ---
st.subheader("Customer Segments (Average RFM per Cluster)")
segment_avg = (
    rfm.groupby("Cluster")[["Recency", "Frequency", "Monetary"]]
    .mean()
    .round(2)
    .reset_index()
)
segment_avg["Cluster"] = segment_avg["Cluster"].astype(str)

# Count customers per cluster for the chart
cluster_counts = rfm["Cluster"].value_counts().reset_index()
cluster_counts.columns = ["Cluster", "Customers"]
cluster_counts["Cluster"] = cluster_counts["Cluster"].astype(str)

col_left, col_right = st.columns(2)

with col_left:
    st.dataframe(segment_avg.set_index("Cluster"), use_container_width=True)

with col_right:
    chart_segments = (
        alt.Chart(cluster_counts)
        .mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
        .encode(
            x=alt.X("Cluster:N", title="Cluster", axis=alt.Axis(labelAngle=0)),
            y=alt.Y("Customers:Q", title="Number of Customers", axis=alt.Axis(labelAngle=0)),
            color=alt.Color(
                "Cluster:N",
                scale=alt.Scale(domain=["0", "1", "2", "3"], range=COLORS),
                legend=None,
            ),
            tooltip=["Cluster", "Customers"],
        )
        .properties(height=300)
    )
    st.altair_chart(chart_segments, use_container_width=True)

st.markdown("---")

# --- Top Customers (table + bar chart side by side) ---
st.subheader("Top 5 Customers by Spending")
top_customers = (
    rfm.nlargest(5, "Monetary")[["CustomerID", "Recency", "Frequency", "Monetary"]]
    .reset_index(drop=True)
)
top_customers.index = top_customers.index + 1
top_customers["CustomerID"] = top_customers["CustomerID"].astype(str)

col_left, col_right = st.columns(2)

with col_left:
    st.dataframe(top_customers, use_container_width=True)

with col_right:
    chart_customers = (
        alt.Chart(top_customers)
        .mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
        .encode(
            x=alt.X("CustomerID:N", sort="-y", title="Customer ID", axis=alt.Axis(labelAngle=0)),
            y=alt.Y("Monetary:Q", title="Spending ($)", axis=alt.Axis(labelAngle=0)),
            color=alt.value(RED),
            tooltip=["CustomerID", alt.Tooltip("Monetary:Q", format=",.2f")],
        )
        .properties(height=300)
    )
    st.altair_chart(chart_customers, use_container_width=True)

st.markdown("---")

# --- Top Products (table + horizontal bar chart) ---
st.subheader("Top 5 Products by Quantity Sold")
top_products = (
    df.groupby("Description")["Quantity"]
    .sum()
    .nlargest(5)
    .reset_index()
)
top_products.columns = ["Product", "Quantity Sold"]
top_products.index = top_products.index + 1

col_left, col_right = st.columns(2)

with col_left:
    st.dataframe(top_products, use_container_width=True)

with col_right:
    chart_products = (
        alt.Chart(top_products)
        .mark_bar(cornerRadiusTopRight=4, cornerRadiusBottomRight=4)
        .encode(
            y=alt.Y("Product:N", sort="-x", title="", axis=alt.Axis(labelAngle=0)),
            x=alt.X("Quantity Sold:Q", title="Quantity Sold", axis=alt.Axis(labelAngle=0)),
            color=alt.value(YELLOW),
            tooltip=["Product", "Quantity Sold"],
        )
        .properties(height=300)
    )
    st.altair_chart(chart_products, use_container_width=True)
