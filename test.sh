#!/bin/bash
awk '{ printf  "%10s\n", $1 }' .npmrc