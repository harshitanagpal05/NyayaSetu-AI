import os
import logging
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


def parse_all_pdfs(folder_path: str):
    """
    Load ALL PDFs from a folder and return combined text
    """
    all_texts = []

    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    for file_name in os.listdir(folder_path):
        if file_name.endswith(".pdf"):
            file_path = os.path.join(folder_path, file_name)

            logger.info(f"Parsing: {file_name}")

            try:
                reader = PdfReader(file_path)
                text = ""

                for page in reader.pages:
                    text += page.extract_text() or ""

                if text.strip():
                    all_texts.append({
                        "text": text,
                        "source": file_name   # 🔥 metadata
                    })

            except Exception as e:
                logger.error(f"Error reading {file_name}: {e}")

    return all_texts