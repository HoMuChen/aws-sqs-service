const { EventEmitter } =  require('events');
const AWS = require("aws-sdk");

class QueueService extends EventEmitter {
  constructor(options) {
    super();
    this.region = options.region;
    this.endpoint = `https:\/\/sqs.${options.region}.amazonaws.com`;
    this.apiVersion = options.apiVersion || '2012-11-05';
    this.batchSize = options.batchSize || 2;
    this.waitTimeSeconds = options.waitTimeSeconds || 20;

    this.sqs = new AWS.SQS({ region: this.region, apiVersion: this.apiVersion });
  }

  getAllQueues() {
    return this.sqs
      .listQueues({})
      .promise();
  }

  sendMessage(url, payload) {
    const params = {
      QueueUrl: url,
      MessageBody: JSON.stringify(payload),
    }

    return this.sqs
      .sendMessage(params)
      .promise()
  }

  removeMessages(url, ids) {
    const params = ids.map(id => ({
      QueueUrl: url,
      ReceiptHandle: id,
    }))
    
    return Promise.all(
      params.map(param => this.sqs
        .deleteMessage(param)
        .promise()
      )
    )
  }

  receiveMessage(url) {
    const params = {
      QueueUrl: url,
      MaxNumberOfMessages: this.batchSize ,
      WaitTimeSeconds: this.waitTimeSeconds,
    }

    return this.sqs
      .receiveMessage(params)
      .promise()
  }

  handleMessages(url, messages, handler) {
    if (!messages) {
      setTimeout(() => this.consume(url, handler), 0);
      return;
    }

    const data = messages.map(message => message.Body);
    const acks = messages.map(message => message.ReceiptHandle);

    this.emit('messages', data);

    handler(
      data,
      () => {
        this.removeMessages(url, acks)
          .then(_ => setTimeout(() => this.consume(url, handler), 0))
          .catch(e => this.emit('error', e.message))
      }
    )
  }

  consume(url, handler) {
    this.receiveMessage(url)
      .then(data => data.Messages)
      .then(messages => this.handleMessages(url, messages, handler))
  }
}

module.exports = QueueService;
