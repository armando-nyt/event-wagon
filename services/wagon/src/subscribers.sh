#! /usr/bin/env bash

SUBSCRIBERS=( 
"NEW_SUBSCRIBER_HERE____NEW_WEBHOOK_HERE"
)

LIST="$(echo ${SUBSCRIBERS[@]} | jq -R 'split(" ") | map(. | split("____") | {subscriber: .[0], webhook: .[1]})')"

echo "$LIST"