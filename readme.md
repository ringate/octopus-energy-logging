Octopus Energy Logging
---

This application is for myself to record and report current and coming hourly electricity rates from the UK's `Octopus Energy Agile` plan. The price rates are for `Eastern England` region only.

It has three parts.
- `app.js`: According to the current date and time for looking up the current electricity rate.
- `sender.js`: Client side on a local computer to monitor and send to a public server when price rate data files change.
- `receiver.js`: As a server side daemon to listen for data files to be received and to return price rates in response to API requests.
