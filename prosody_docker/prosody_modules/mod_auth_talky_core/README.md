# Talky Core Auth

This module asks the Talky Core API to verify that a username/password combination is valid.

The validation is done by using HTTP Basic authorization. A 200 level response grants access.


## Configuration

- `talky_core_auth_url` - API URL used to validate username/passwords.
