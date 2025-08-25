import requests
from datetime import datetime, timedelta
import locale
import sys
import json

# NL maandnamen
try:
    locale.setlocale(locale.LC_TIME, "nl_NL.utf8")
except locale.Error:
    # Fallback: use default locale if Dutch is not available
    pass

# Episodes ophalen
url = "https://kbdata.nl/episodes.json"
resp = requests.get(url)
episodes = resp.json()

# Vorige maand bepalen
today = datetime.now()
first_day_this_month = today.replace(day=1)
last_month_last_day = first_day_this_month - timedelta(days=1)
target_month = last_month_last_day.month
target_year = last_month_last_day.year

# Filter afleveringen
filtered = [
    ep for ep in episodes
    if datetime.strptime(ep["date"], "%Y-%m-%d").month == target_month
    and datetime.strptime(ep["date"], "%Y-%m-%d").year == target_year
]

# Bericht opbouwen
if not filtered:
    message = f"In {last_month_last_day.strftime('%B %Y')} zijn er geen afleveringen verschenen. #kleineboodschap"
else:
    parts = []
    for ep in filtered:
        dt = datetime.strptime(ep["date"], "%Y-%m-%d")
        tijd = f"{ep['duration'] // 60}:{ep['duration'] % 60:02d}"  # mm:ss → zonder seconden
        parts.append(
            f"Op {dt.strftime('%-d %B %Y')} luisterde je {tijd} naar '{ep['title']}' ({ep['category']})."
        )
    message = f"In {last_month_last_day.strftime('%B %Y')} verschenen de volgende afleveringen van Kleine Boodschap:\n\n" + "\n".join(parts) + "\n\n#kleineboodschap"

# Voor GitHub Action output
print(message)
