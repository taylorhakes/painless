## 0.7.0
Initial Release

## 0.8.0
Features
- Created generic reporter API
- New spec and dot reporter
- Expose chai directly to allow chai.use
```
var painless = require('painless');
var chai = painless.chai;
```
- `--include,-i` to include additional files
- Updated `variable-diff` for better looking diffs

Changes
- New dot reporter is default. Use `-r=spec` to keep using spec

Deprecation
- `--tap,-t` will be removed in the next version

Breaking
- None

### 0.8.1
- Updated coloring for spec reporter times

### 0.8.2
- Added `none` reporter. Useful for code coverage reports

### 0.8.3
- Updated spec reporter to show group names

## 0.9.0
Features
- Browser support and karma support with `karma-painless`

Bugs
- Fixed bugs with beforeEach and afterEach

### 0.9.1
- Fixed bug with 0.10 Node not having Promise

### 0.9.5
- Fixed bug where afterEach was not executed on test failure
