#!/bin/sh

env

set -e

[ ! -d "$PWD/dist" ] && npm run build

exec npm run start:prod_doc