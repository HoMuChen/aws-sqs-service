# aws-sqs-service
AWS Simple Queue Service(SQS)

## Requirement
Enviroment variables - IAM credentials
```bash
export AWS_ACCESS_KEY_ID=your-id
export AWS_SECRET_ACCESS_KEY=your-secret
```

## Install
```bash
npm i -S aws-sqs-service
```

## Usage
### Config
```js
const QueueService = require('aws-sqs-service');
const sqs = new QueueService(options);
```
#### options
* region -- required
* batchSize -- The maximum number of messages to return. valid value 1 to 10. Default 1.
* apiVersion

### Send Message to Queue
```js
sqs.sendMessage(url, payload)  //url -> queueUrl, payload -> JSON object
```

### Consume from Queue
```js
sqs.consume(url, function(data, done) => {
  //doSomethingWith(data)
  //done()
  
  //doSomethingAsyncWith(data)
  //  .then(_ => done())
})
```
