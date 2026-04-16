import os
import faiss
import numpy as np
import requests


def get_embedding(texts: list[str]) -> np.ndarray:
    HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    HF_TOKEN = os.getenv("HF_TOKEN")

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    response = requests.post(HF_API_URL, headers=headers, json={"inputs": texts})

    if response.status_code != 200:
        raise ValueError(f"HuggingFace API error: {response.status_code} - {response.text}")

    embeddings = np.array(response.json(), dtype=np.float32)

    # Handle shape: sometimes HF returns (1, dim) for single input
    if embeddings.ndim == 3:
        embeddings = embeddings.mean(axis=1)

    return embeddings


class VectorStore:
    def __init__(self):
        self.index = None
        self.text_chunks = []
        self.sources = []

    def add_chunks(self, chunks):
        """
        Accepts either:
          - List[str]
          - List[{"text": str, "source": str}]
        """
        print(f"Debug: Adding {len(chunks)} chunks to vector store")

        normalised = []
        for c in chunks:
            if isinstance(c, dict):
                text   = c.get("text", "").strip()
                source = c.get("source", "")
            else:
                text   = str(c).strip()
                source = ""

            if len(text) > 30:
                normalised.append((text, source))

        if not normalised:
            print("Debug: No valid chunks to add")
            return

        texts   = [t for t, _ in normalised]
        sources = [s for _, s in normalised]

        self.text_chunks.extend(texts)
        self.sources.extend(sources)

        # Batch in groups of 64 to avoid HF API limits
        all_embeddings = []
        batch_size = 64
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = get_embedding(batch)
            all_embeddings.append(embeddings)

        embeddings = np.vstack(all_embeddings).astype(np.float32)
        faiss.normalize_L2(embeddings)

        print(f"Debug: Embeddings shape: {embeddings.shape}")

        if self.index is None:
            dimension = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)
            print("Debug: Created FAISS cosine similarity index")

        self.index.add(embeddings)
        print(f"Debug: Total vectors in index: {self.index.ntotal}")

    def search(self, query, top_k=5, threshold=0.3):
        print(f"\nDebug: Searching for query: '{query}'")

        if self.index is None or self.index.ntotal == 0:
            print("Debug: Index empty")
            return []

        query_embedding = get_embedding([query]).astype(np.float32)
        faiss.normalize_L2(query_embedding)

        scores, indices = self.index.search(query_embedding, top_k)

        print(f"Debug: Scores: {scores.tolist()}")
        print(f"Debug: Indices: {indices.tolist()}")

        results = []
        for i, idx in enumerate(indices[0]):
            if 0 <= idx < len(self.text_chunks):
                score = float(scores[0][i])
                if score > threshold:
                    results.append({
                        "chunk":  self.text_chunks[idx],
                        "source": self.sources[idx],
                        "score":  score,
                    })

        print(f"Debug: Retrieved {len(results)} relevant chunks")
        return results

    def save_index(self, index_path="faiss_index.bin", meta_path="faiss_meta.pkl"):
        import pickle

        if self.index is None:
            print("No index to save")
            return

        faiss.write_index(self.index, index_path)

        with open(meta_path, "wb") as f:
            pickle.dump({
                "text_chunks": self.text_chunks,
                "sources": self.sources
            }, f)

        print("✅ FAISS index saved")

    def load_index(self, index_path="faiss_index.bin", meta_path="faiss_meta.pkl"):
        import pickle

        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            print("No saved index found")
            return False

        self.index = faiss.read_index(index_path)

        with open(meta_path, "rb") as f:
            data = pickle.load(f)
            self.text_chunks = data["text_chunks"]
            self.sources = data["sources"]

        print(f"✅ FAISS index loaded ({len(self.text_chunks)} chunks)")
        return True