#!/bin/bash
#
# Eve.js Compilation Script <evejs.com>
#
# Simple curl alias to run a file through Google Closure.
#
# Usage: ./compile.sh <in> <out>

if [ "$#" -lt 2 ]; then
	echo "Usage: ./compile.sh <input> <output>"
fi

curl -s \
	-d output_format=text \
	-d compilation_level=SIMPLE_OPTIMIZATIONS \
	-d output_info=compiled_code \
	--data-urlencode "js_code@$1" \
	http://closure-compiler.appspot.com/compile \
	>> $2