# NTNU Course

Query Course Information of National Taiwan Normal University.

## Installation

### NPM

```bash
npm i ntnu-course
```

### YARN

```bash
yarn add ntnu-course
```

### PNPM

```bash
pnpm i ntnu-course
```

## Usage

This package supports both `cjs` and `esm` format.

```javascript
// cjs
const query = require("ntnu-course");

// esm
import query from "ntnu-course";
```

### Query Course Metadata

Returns a list of course meradata that matches the query.

For example, to query all courses that are offered by CSIE:

```javascript
const meta = await query.meta({
    department: "資工系",
});
```

### Query Course Full Information

In addition to the metadata, the full information includes other information such as grading policy, course description, etc.

To query the full information of a course, you should pass the metadata of the course as the first argument.

```javascript
const info = await query.info(meta[0]);
```

### Turn Off Cache

The default behavior is to cache the result of the query in the memory.

You can turn off the cache by setting `cache` to `false`:

```javascript
query.cache = false;
```

And if you want to clear the previous cache, you can use `clear`:

```javascript
query.clear();
```

## Links

### GitHub Repository

<https://github.com/JacobLinCool/NTNU-Course>

### NPM Package

<https://www.npmjs.com/package/ntnu-course>

### Documentation

<https://jacoblincool.github.io/NTNU-Course/>

### NTNU Course Crawler

Related project.

<https://github.com/JacobLinCool/NTNU-Course-Crawler>
