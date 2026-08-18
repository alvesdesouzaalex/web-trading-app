#!/bin/sh

set -e

: "${API_URL:?API_URL environment variable is required}"

envsubst '${API_URL}' \
  < /usr/share/nginx/html/assets/env.template.js \
  > /usr/share/nginx/html/assets/env.js