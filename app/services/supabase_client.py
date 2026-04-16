from dotenv import load_dotenv
import os

# 👇 Get absolute root path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

# 👇 Load .env from root
load_dotenv(os.path.join(BASE_DIR, ".env"))

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("DEBUG PATH:", os.path.join(BASE_DIR, ".env"))
print("DEBUG URL:", SUPABASE_URL)

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("DEBUG URL:", SUPABASE_URL)
print("DEBUG KEY:", SUPABASE_KEY)