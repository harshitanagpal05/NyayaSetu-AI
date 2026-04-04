import re


def extract_legal_sections(text: str):
    """
    Extract legal references like:
    - Section 503
    - Article 21
    - IPC 351
    """
    patterns = [
        r"section\s+\d+[a-zA-Z]*",
        r"article\s+\d+",
        r"ipc\s+\d+"
    ]

    matches = []

    for pattern in patterns:
        found = re.findall(pattern, text.lower())
        matches.extend(found)

    return list(set(matches))