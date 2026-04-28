import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


def build_item_matrix(df):
    """Create a user-item matrix (CustomerID vs StockCode)."""
    matrix = df.groupby(["CustomerID", "StockCode"])["Quantity"].sum().unstack(fill_value=0)
    return matrix


def get_recommendations(matrix, stock_code, top_n=5):
    """Return top N similar products for a given StockCode using cosine similarity."""
    if stock_code not in matrix.columns:
        return []

    # Compute similarity between all items (transpose so items are rows)
    item_vectors = matrix.T
    target_index = list(item_vectors.index).index(stock_code)

    # Calculate similarity of target item with all other items
    similarities = cosine_similarity(
        item_vectors.iloc[target_index : target_index + 1],
        item_vectors,
    )[0]

    # Get top similar items (exclude the item itself)
    similar_indices = similarities.argsort()[::-1][1 : top_n + 1]
    results = [(item_vectors.index[i], round(similarities[i], 3)) for i in similar_indices]

    return results
