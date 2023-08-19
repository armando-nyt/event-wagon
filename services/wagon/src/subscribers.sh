#! /usr/bin/env bash

SUBSCRIBERS=( 
    # NEW_SUBSCRIBER_HERE 
)

LIST="$(echo ${SUBSCRIBERS[@]} | jq -R 'split(" ") | map(. | split(",") | {subscriber: .[0], webhook: .[1]})')"

echo "$LIST"