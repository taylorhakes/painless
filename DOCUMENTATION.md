# Documentation

## Reporter API
Painless supports creating your own custom reporters

### Create a custom reporter
The easiest way to get started is to use `painless-reporter-helper`. Advanced users can use the [advanced api](#advanced-reporters)
```
npm install painless-reporter-helper --save
```
Create a new reporter file
```js
var helper = require('painless-reporter-helper');
module.exports = helper({
    'test.end': function(test) {
        if (test.success) {
            return test.name + ' success!\n';
        }
        
        return test.name + ' failed!\n';
    }
});
```
The helper function takes a single JS Object. The keys are the names of the events you want to listen to. 
The values are functions that are passed the data associated with the event. The return value **MUST BE A STRING**. It is sent to the console.
#### Event Types
##### `test.end` - When a test finishes

Data associated
```js
{
  name: <string>,      // name of the test
  success: <boolean>   // Whether the test was successful
  error: <null/Object> // null if successful, Object if the test failed (see below)
  time: <number>,      // time the test took to run in milliseconds
  cb: <function>,      // test function
  timeout: <number>,   // timeout of the test, shows default if none set
  options: <Object>    // any options passed to the test
}
```
error key has the following structure
```js
{
  message: <string>, // error message
  stack: <Array>,    // lines in the stack when error occurred
  expected: <any>,   // expected value. Key may not exist if not supported by assertion library.
  actual: <any>      // actual value. Key may not exist if not supported by assertion library.
}
```
##### `group.start` - When a new group starts

Data associated
```js
{
  name: <string> // name of the group
}
```
##### `group.end` - When a group finishes

Data associated
```js
{
  name: <string>,            // name of the group
  success: <boolean>,        // whether all group tests were successful (no errors)
  testCount: <number>,       // number of tests in the group,
  errors: <Array<test.end>>, // An array of tests that failed in the group
  time: <number>             // time to run the group in milliseconds
}
```
##### `end` - When all tests have finished

Data ssociated
```js
{
  success <boolean>,         // whether all tests were successful (no errors)
  testCount: <number>,       // number of tests total,
  errors: <Array<test.end>>, // An array of all tests that failed
  time: <number>             // time to run all tests in milliseconds
}
```

#### Troubleshooting
 - TypeError: invalid data
 
 This means you are **NOT** returning a string from one of your event functions. Check the return values.

#### Advanced Reporters
Here is the signature of a reporter function. It takes in a Stream and returns a new Stream. 
```js
/**
 * @param {Stream} stream Node object stream
 * @return {Stream}
 */
module.exports = function myReporter(stream) {
    

}
```
The Stream sends javascript objects with the following signature.
```js
{ type: '<MESSAGE_TYPE>', data: { <MESSAGE_DATA> } }
```
See [Event Types](#event-types) for message types and data structures. The function must return and new Stream.