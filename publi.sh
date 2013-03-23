#!/bin/bash

#TODO: check whether we need to run the build script. this may be achieved by
# using
#git status -suno
# sed'ing out the junk, then looping over every line, stat'ing it to see if it
# was modified after master.js
# my shell skills are not good enough yet

#execute the build script
node build.js

if [ $? -ne 0 ]
then
	exit $?
fi

#TODO: error checking much?

# http://stackoverflow.com/questions/6245570/get-current-branch-name
branch=$(git rev-parse --abbrev-ref HEAD)
git commit -am "$1"
git push origin $branch
