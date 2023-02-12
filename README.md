## Actions Hourly

Schedules cron each 45, 48, or 50 minutes when you need it.

- Need to run GitHub actions "at least" once per hour?
- Can't waste [runtime limits][limits] while you're asleep?
- Can't wate time running at usual peak times?
- Can't calculate the [schedule][cron] by hand?

This package is a niche solution to all these issues.

```
npx actions-hourly <PERIOD> <WAKE> <SLEEP>
```

- The `PERIOD` is 45, 48, or 50.
- The `WAKE` is the start time (with `AM` or `PM`)
- The `SLEEP` is the end time (with `AM` or `PM`)

This uses the `TZ` variable, which defaults to local time.

### Examples

Once each 45 min from 9AM - 5PM in US Eastern.
```
export TZ="America/New_York"
npx actions-hourly 45 9AM 5PM
```

Example output with random offset 3 minutes.

```json
{
    "crons_yaml": "- cron: 3 14-20/3 * * *\n- cron: 48 14-20/3 * * *\n- cron: 33 15-21/3 * * *\n- cron: 18 16-19/3 * * *",
    "crons_list": [
        "3 14-20/3 * * *",
        "48 14-20/3 * * *",
        "33 15-21/3 * * *",
        "18 16-19/3 * * *"
    ],
    "header": "Every 45 minutes, after 3 minute offset",
    "local": "9AM < (America/New_York) < 5PM",
    "utc": "14:03 ≤ (UTC) ≤ 21:33"
}
```

---

Once each 50 min from 9AM - 5PM in India Standard Time
```
export TZ="Asia/Calcutta"
npx actions-hourly 50 9AM 5PM
```

Example output with random offset 7 minutes.

```json
{
    "crons_yaml": "- cron: 27 3-8/5 * * *\n- cron: 17 4-9/5 * * *\n- cron: 7 5-10/5 * * *\n- cron: 57 5-10/5 * * *\n- cron: 47 6 * * *",
    "crons_list": [
        "27 3-8/5 * * *",
        "17 4-9/5 * * *",
        "7 5-10/5 * * *",
        "57 5-10/5 * * *",
        "47 6 * * *"
    ],
    "header": "Every 50 minutes, after 7 minute offset",
    "local": "9AM < (Asia/Calcutta) < 5PM",
    "utc": "03:27 ≤ (UTC) ≤ 10:57"
}
```

---

[limits]: https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions
[cron]: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule
