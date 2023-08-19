#! /usr/bin/env bash

SUBSCRIBERS=(
"super-unique-subscriber-id1____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook1"
"super-unique-subscriber-id2____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook2"
"super-unique-subscriber-id3____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook3"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"super-unique-subscriber-id____https:_SLASH__SLASH_a-unique-domain.com_SLASH_webhook"
"NEW_SUBSCRIBER_HERE____NEW_WEBHOOK_HERE"
)

LIST="$(echo ${SUBSCRIBERS[@]} | jq -R 'split(" ") | map(. | split("____") | {subscriber: .[0], webhook: .[1]})')"

echo "$LIST"