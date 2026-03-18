# asertu Optimizer Node.js SDK

Official Node.js SDK for asertu Optimizer.

> Initial placeholder release used to reserve the npm package name.

## Installation

```bash
npm install @asertu/optimizer
```

## Usage

```js
import { Optimizer } from "@asertu/optimizer";

const client = new Optimizer({ apiKey: "demo" });
console.log(client.optimize("hello world"));
```
