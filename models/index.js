const mongoose = require('mongoose');
mongoose
  .connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(
    () => console.log('=== MongoDB connection successful ==='),
    error => console.error('MongoDB connection fail :', error)
  );
