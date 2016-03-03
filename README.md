# qmail-wildcard-store

Stores incoming messages into maildirs with names specified by RECIPIENT environment set by qmail-local.

# Spam filter

Make sure that an email contains 'X-Spam-Flag: YES' to indicate it is a spam. An example config would be putting this into .qmail file:
```
|/usr/bin/spamassassin -L -e | /location/to/qmail-wildcard-store /path/to/maildir
```
