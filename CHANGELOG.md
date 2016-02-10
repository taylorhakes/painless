0.7.0
Initial Release

0.8.0
Features
- Created generic reporter API
- New spec and dot reporter
- Expose chai directly to allow chai.use
```
var painless = require('painless');
var chai = painless.chai;
```

Changes
- New dot reporter is default. Use `-r=spec` to keep using spec