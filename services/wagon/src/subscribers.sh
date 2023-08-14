#! /usr/bin/env bash

SUBSCRIBERS=( 
    "FOO,BAR"
    "BAR,BAZ" 
    "BAZ,WHATEVER" 
    # NEW_SUBSCRIBER_HERE 
)

LIST="$(echo ${SUBSCRIBERS[@]} | jq -R 'split(" ") | map(. | split(",") | {subscriber: .[0], webhook: .[1]})')"

echo "$LIST"