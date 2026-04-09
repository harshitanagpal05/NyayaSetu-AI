def clean_and_chunk_documents(documents, chunk_size=500):
    """
    Takes list of {text, source}
    Returns chunks WITH metadata
    """
    chunks = []

    for doc in documents:
        text = doc["text"]
        source = doc["source"]

        words = text.split()

        for i in range(0, len(words), chunk_size):
            chunk_text = " ".join(words[i:i + chunk_size])

            chunks.append({
                "text": chunk_text,
                "source": source   # 🔥 keep source
            })

    return chunks