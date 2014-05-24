
test: 
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter spec \
		--bail \
		--harmony

.PHONY: test
