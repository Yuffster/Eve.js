#!/bin/bash
#
# Eve.js Compilation Script <evejs.com>
#
# @author: Michelle Steigerwalt <@Yuffster>
#
# Usage:
#
#     ./tag_release.sh <version>
#
# Assuming you don't have any bugs in your code, this file will perform the
# following actions:
#
#     1. Run the unit test suite against src/eve.js
#     2. Compress eve.js with copyright notice using Google Closure Compiler
#     3. Re-run the unit test suite against the minified JavaScript file
#     4. Change package.json to reflect new version number
#     5. Change the second line of Eve.js to reflect new version number
#     6. Commit changes to Git
#     7. Create a new tag with the version number provided
#     8. Merge master branch with stable branch
#     9. Push tags and changes through Git
#    10. If a second argument is provided for the location of the local fork
#        of CDNJS, the script will copy the new eve.min.js file to the new
#        version directory, update package.json and commit/push the changes.
#
# If the unit tests fail, the script will attempt to restore the previous
# version of eve.min.js.

# Ensure that we've received a single argument.
if [ $# -lt 1 ]; then
	echo "Usage: $0 <version number>"
	exit 1
fi

VERSION=$1
VERSION_STRING="Eve.js <evejs.com> - v$VERSION $(date +"%B %d, %Y")"

# Ensure the version number is in the currect format, mainly so we don't end
# up accidentally tagging something as vv1.3.
if [[ $VERSION =~ [^0-9.]|\.\.|\.$ ]]; then
	echo "Version number can only contain numbers separated by dots."
	exit 1
fi

# Second argument is the location of CDNJS.
if [ $# -eq 2 ]; then
	CDN="$2ajax/libs/eve.js/"
	if [ ! -d "$CDN" ]; then
		echo "Directory doesn't exist: $CDN"
		exit 1
	fi
fi

# keeps track of whether or not we've changed eve.min.js
TOUCHED=0 

# Checks to see if the last command executed correctly.  If not, we roll back
# any relevant changes and exit with a failure code.
function check_status {
	if [ "$?" -gt 0 ]; then
		echo "Build failed. Next time, try compiling with fewer bugs."
		if [ $TOUCHED -eq 1 ]; then
			echo "Restoring previous version of eve.min.js"
			git checkout eve.min.js
		fi
		exit 1
	fi
}

echo "Ensuring we're on the master branch"
git checkout master

echo "Stashing changes for clean working tree."
echo "Run 'git stash pop' to restore if something goes wrong."
git stash --keep-index -q

# Run our tests against the main eve.js file and ensure that they've passed.
echo "Running tests against src/eve.js..."
./scripts/test.sh
check_status

# Run the main eve.js file through Google Closure Compiler.
echo "Building release $VERSION"

# Ready? Let's start messing with eve.min.js...
rm eve.min.js
TOUCHED=1

# Write the version number to the top of our new eve.min.js
echo // $VERSION_STRING >> eve.min.js

./scripts/compile.sh src/eve.js eve.min.js

# Run the unit tests again against the minified version.
echo "Running tests against minifed version..."
./scripts/test.sh eve_file=eve.min
check_status

# We're done testing, so we can write the version number to the main eve.js
# file and to package.json.
sed -i "" "2s/.*/ * $VERSION_STRING/" src/eve.js 
sed -i "" "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

# PARTY TIME. \o/
echo "Build succeeded."

echo "Commiting to Git."

# Add the new eve.min.js file and package.json to the repository.
git add eve.min.js package.json src/eve.js
git commit -m "Build of version $VERSION"

# Merge master to stable (since we've run all our tests)
echo "Merging to stable branch."
git checkout stable
git merge master
git checkout master

# Now tag the release and push our changes.
echo "Tagging v$VERSION release."
git tag v$VERSION
git push --tags

echo "Restoring working tree."
git stash apply -q

# Push to CDNJS
if [ $CDN ]; then
	PWD=`pwd`
	echo "Adding v$VERSION to local fork of CDNJS."
	mkdir "$CDN$VERSION"
	cp eve.min.js "$CDN$VERSION"
	sed -i "" "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" "$CDN""package.json"
	cd "$CDN"
	git add -A
	git commit -m "Updated Eve.js version to $VERSION."
	git push
	cd "$PWD"
fi

echo "Happy v$VERSION release! \o/"