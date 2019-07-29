const app = require('./app');
const PORT = process.env.SERVER_PORT || 8080;

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
});