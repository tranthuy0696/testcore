#!/bin/bash

pattern='\"name\"\s*:\s*\"([^\"]+)\"'
content=$(awk '//' package.json)
if [[ "$content" =~ $pattern ]]; then
    FILENAME=${BASH_REMATCH[1]}
fi

patternVersion='\"version\"\s*:\s*\"(([0-9]+\.[0-9]+\.)([0-9]+))\"'
#update version in package.json
if [[ "$content" =~ $patternVersion ]]; then
    VERSION=${BASH_REMATCH[2]}$1
    sed -i 's/\"version\": \"'${BASH_REMATCH[1]}'\"/\"version\": \"'${VERSION}'\"/g' package.json
fi

# update version in client package.json
packageClientFile=$(awk '//' client/package.json)
if [[ "$packageClientFile" =~ $patternVersion ]]; then
    sed -i 's/\"version\": \"'${BASH_REMATCH[1]}'\"/\"version\": \"'${BASH_REMATCH[2]}$1'\"/g' client/package.json
fi

echo "$FILENAME ${VERSION}"
