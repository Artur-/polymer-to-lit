To test this tool, do the setup dance once

```
npm install
node_modules/.bin/tsc convert.ts
```


Then run it and give it a Polymer JS file as the only argument
```
node convert.js in/grid-columns.js
```

This will convert `in/grid-columns.js` into a Lit element and place the output in `in/grid-columns.out.js`
