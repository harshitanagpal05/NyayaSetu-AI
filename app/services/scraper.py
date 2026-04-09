import requests
def scrape_legal_content(query):
    url = f"https://indiankanoon.org/search/?formInput={query.replace(' ', '+')}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        print(f"Debug: Response text (first 500 chars): {response.text[:500]}")
        return response.text
    except requests.RequestException as e:
        return f"An error occurred: {e}"
result = scrape_legal_content("Section 420 IPC")
print(result[:500])
