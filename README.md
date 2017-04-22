# AutoRouter

AutoRouter creates an Express Router out of sub-routers in a folder
structure.

That means if you have the following folder structure with Express
Routers in each file;
```
-  routes
  -  index.js
  -  api
    -  users.js
    -  tasks.js
    -  lists.js
```

And you call AutoRouter like this;
```
app.use(autorouter());
```

AutoRouter will create an Express Router with endpoints referring
to the folder / file structure, and you'll have these endpoints;
```
/
/api/users
/api/tasks
/api/lists
```

## Usage

AutoRouter is built on **TypeScript**, so here's a TS example:

```
import * as express from 'express';
import * as autorouter from 'autorouter';

const options = {};
const app = express();

app.use(autorouter(options));
app.listen(3000);
```

And the same in **JS**:
```
var express = require('express');
var autorouter = require('autorouter');

var options = {};
var app = express();

app.use(autorouter(options));
app.listen(3000);
```

## Options

### base
The base folder to start read files from relative to the current working
directory. By default, it's `routes`

### force
When *force* is false, AutoRouter will throw an error when it's trying
to add a router to the same endpoint twice. When *force* is true, it's
only warning you that it happened. This can happen when you have a
folder structure containing e.g. both `/api/index.js` and `/api.js`,
since the endpoint `/api` will be tried to add twice. By default, it's
`false`
