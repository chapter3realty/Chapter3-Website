# The home page before the frosted glass redesign (2026-11-14)

`index.html` here is `chapter3realty/index.html` exactly as it was before the glass redesign (from the commit in
`FROM_COMMIT`). To put it back:

```
cp design/home-before-glass-2026-11-14/index.html chapter3realty/index.html
node build.js preflight
```

Then commit and deploy. The glass is one style block, `<style id="c3-home-glass">` at the end of the page head;
deleting that block alone also brings the old look back.
