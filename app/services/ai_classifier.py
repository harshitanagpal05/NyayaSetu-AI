from app.services.llm import query_groq_llm

def classify_legal_ai(query: str) -> bool:
    prompt = f"""
Classify the following query:

Query: "{query}"

Is this related to law, legal rights, police, court, or legal action?

Answer ONLY:
YES or NO
"""

    response = query_groq_llm(prompt).strip().lower()

    return "yes" in response