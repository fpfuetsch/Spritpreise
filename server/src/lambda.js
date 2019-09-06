const awsServerlessExpress = require('aws-serverless-express');
const createApp = require('./app');

module.exports.handler = (event, context) => {
  createApp().then(app => {
    const server = awsServerlessExpress.createServer(app);
    awsServerlessExpress.proxy(server, event, context);
  });
};