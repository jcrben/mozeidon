build-firefox-addon:
	cd firefox-addon && ./build.sh
build-chrome-addon:
	cd chrome-addon && ./build.local.sh
build-cli:
	cd cli && go build

test-cli:
	cd cli && go test ./...

test-firefox-addon:
	cd firefox-addon && npm test

test: test-cli test-firefox-addon

all: build-cli build-firefox-addon build-chrome-addon
