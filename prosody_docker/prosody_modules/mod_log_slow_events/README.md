# mod\_log\_slow\_events

Community Prosody module. [See source](https://hg.prosody.im/prosody-modules/file/tip/mod_log_slow_events)

This module monitors event execution time and logs a warning if it exceeds a configured threshold (by default 0.5 seconds).


## Configuration

- `log_slow_events_threshold` - The time in seconds to wait before logging a slow event. Default is `0.5`.

