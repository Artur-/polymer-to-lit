#!/bin/bash

rm in/*.out.js
for file in in/*.js
do 
  F=`echo $file|sed "s#in/##"|sed "s/.js//"`
  echo $F 
  node ../frontend/convert.js in/$F.js -out
  diff $file.out.js expected/$F.js -wu 
done
