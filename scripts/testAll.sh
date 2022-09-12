#!/bin/bash

rm in/*.out.js
for file in in/*.js
do 
  F=`echo $file|sed "s#in/##"|sed "s/.js//"`
  node_modules/.bin/tsc convert.ts 
  echo $F 
  node convert.js in/$F.js
  diff in/$F.out.js expected/$F.js -wu 
done
