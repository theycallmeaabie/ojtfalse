from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


def add_clusters(rfm, n_clusters=4):
    """Scale RFM values and assign cluster labels."""
    # Scale the RFM columns
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])

    # Apply KMeans clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    rfm["Cluster"] = kmeans.fit_predict(rfm_scaled)

    return rfm
