#!/usr/bin/env python3
import json
import re
from datetime import datetime

def clean_amount(s):
    if not s:
        return ""
    s = s.strip()
    if not s:
        return ""
    if "k giới hạn" in s.lower():
        return "unlimited"
    digits = re.sub(r"[^\d]", "", s)
    return digits if digits else s

def clean_percent(s):
    if not s:
        return ""
    s = s.strip()
    if not s:
        return ""
    if "%" in s:
        return s
    if s.replace(".", "").replace("-", "").isdigit():
        return f"{s}%"
    return s

def is_category_word(text):
    t = text.strip().lower()
    if len(t) < 2:
        return False
    words = {"online", "du lịch", "ăn uống", "thời trang", "siêu thị", "khác",
        "mua sắm", "giáo dục", "y tế", "bảo hiểm", "giải trí", "thể thao",
        "pos", "nước ngoài", "visa", "jcb", "mastercard", "american express",
        "di chuyển", "nhà hàng", "khách sạn", "vé máy", "gym", "fitness",
        "shopping", "cashback", "ngoại tệ", "ads", "tháng", "siêu thị,",
        "du lịch,", "khách sạn,", "bảo hiểm,"}
    if t in words:
        return True
    return False

def parse_cards_data(in_file, out_file):
    with open(in_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    cards = []
    current_card = None
    current_categories = []

    for line in lines:
        line = line.rstrip("\n\r")
        if line.startswith("1:"):
            continue
        if not line.strip():
            continue

        content = re.sub(r"^\d+:\s*", "", line)
        is_continue = content.startswith("\t")
        parts = [p.strip() for p in content.split("\t")]
        parts = [p for p in parts if p]  # Remove empty

        if is_continue:
            if current_card and parts[0]:
                cat = parts[0]
                pct = clean_percent(parts[1]) if len(parts) > 1 else ""
                amt = clean_amount(parts[2]) if len(parts) > 2 else ""
                current_categories.append({"category": cat, "rate": pct, "maxCashback": amt})
        else:
            if parts[0]:
                first = parts[0]
                if is_category_word(first):
                    if current_card and len(parts) >= 2:
                        cat = first
                        pct = clean_percent(parts[1])
                        amt = clean_amount(parts[2]) if len(parts) > 2 else ""
                        current_categories.append({"category": cat, "rate": pct, "maxCashback": amt})
                else:
                    if current_card and current_categories:
                        cards.append({"name": current_card, "cashbackCategories": current_categories})
                    current_card = first
                    current_categories = []
                    if len(parts) >= 2:
                        cat = parts[1]
                        pct = clean_percent(parts[2]) if len(parts) > 2 else ""
                        amt = clean_amount(parts[3]) if len(parts) > 3 else ""
                        current_categories.append({"category": cat, "rate": pct, "maxCashback": amt})

    if current_card and current_categories:
        cards.append({"name": current_card, "cashbackCategories": current_categories})

    result = {"lastUpdated": datetime.now().strftime("%Y-%m-%d"), "cards": cards}
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Parsed {len(cards)} cards")
    return result

if __name__ == "__main__":
    parse_cards_data("/home/ubuntu/GIT/cccalendar/data/cards_data.txt", "/home/ubuntu/GIT/cccalendar/data/cards.json")
