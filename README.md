== Rewriting frontend files

The frontend tool is in the `frontend` folder

To test this tool, do the setup dance once

```
cd frontend
npm install
node_modules/.bin/tsc convert.ts
```


Then run it and give it a Polymer JS file as the only argument
```
node convert.js in/grid-columns.js
```

This will convert `in/grid-columns.js` into a Lit element and place the output in `in/grid-columns.out.js`

== Rewriting Java files

The Java tool is in the `java` folder

To test this tool, do the setup dance once
```
cd java
mvn package
```

Then run it and give it a PolymerTemplate Java file
```
mvn exec:exec -Dfile=/my/project/src/main/java/my/package/MyTemplate.java
```
