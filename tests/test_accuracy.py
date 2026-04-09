import json
from app.services.intent import is_legal_query

def evaluate():
    with open("tests/test_cases.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    correct = 0
    total = len(data)

    for item in data:
        query = item["query"]
        expected = item["expected"]

        result, _ = is_legal_query(query)

        predicted = "legal" if result else "non_legal"

        if predicted == expected:
            correct += 1
        else:
            print(f"❌ Wrong: {query} → Predicted: {predicted}, Expected: {expected}")

    accuracy = (correct / total) * 100

    print(f"\n✅ Accuracy: {accuracy:.2f}% ({correct}/{total})")

if __name__ == "__main__":
    evaluate()