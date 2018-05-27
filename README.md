# Darknet.JS
Just when you thought the world was beautiful, I put YOLO into JavaScript.

## Example
```typescript
import { Darknet } from 'darknet.js';

let darknet = new Darknet({
    weights: './rubbish.weights',
    config: './rubbish.cfg',
    metadata: {
        classes: 2,
        names: [ 'dog', 'cat' ]
    },
    library: './libdarknet'
});

console.log(darknet.detect('/image/of/a/dog/'));
```
