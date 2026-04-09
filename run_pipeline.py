from app.services.parser import parse_pdf
from app.services.cleaner import clean_and_chunk_text
from app.services.vector_store import VectorStore
from app.services.llm import query_groq_llm
from app.services.safety import validate_response   # 👈 NEW

def run_pipeline(pdf_path, user_query):
    # Step 1: Parse PDF
    print("Step 1: Parsing PDF...")
    raw_text = parse_pdf(pdf_path)

    if not raw_text:
        print("No text extracted from PDF. Exiting.")
        return

    # Step 2: Clean and chunk text
    print("Step 2: Cleaning and chunking text...")
    chunks = clean_and_chunk_text(raw_text)

    if not chunks:
        print("No chunks created from text. Exiting.")
        return

    print(f"Chunks created: {len(chunks)}")

    # Step 3: Build FAISS vector store
    print("Step 3: Building vector store...")
    vector_store = VectorStore()
    vector_store.add_chunks(chunks)

    # Step 4: Retrieve relevant chunks
    print("Step 4: Retrieving relevant chunks...")
    relevant_chunks = vector_store.search(user_query)

    if not relevant_chunks:
        print("No relevant chunks found. Exiting.")
        return

    print(f"Retrieved chunks: {len(relevant_chunks)}")

    # Step 5: Query LLM
    print("Step 5: Querying LLM...")
    context = "\n\n".join(relevant_chunks)
    llm_response = query_groq_llm(context, user_query)

    # Step 6: Safety validation 👈 IMPORTANT
    print("Step 6: Applying safety layer...")
    safe_output = validate_response(user_query, relevant_chunks, llm_response)

    # Step 7: Final Output
    print("\n===== FINAL OUTPUT =====\n")
    print("Answer:", safe_output["answer"])
    print("Confidence:", safe_output["confidence"])
    print("Safe:", safe_output["safe"])


if __name__ == "__main__":
    pdf_path = "data/raw/pdfs/SC_New.pdf"
    
    # 🔥 Better query (important)
    user_query = "Summarize the main legal issue in this Supreme Court judgment"

    run_pipeline(pdf_path, user_query)
    
    print("\n===== RETRIEVED CHUNKS =====\n")
for i, chunk in enumerate(relevant_chunks[:3]):
    print(f"\n--- Chunk {i+1} ---\n")
    print(chunk[:500])