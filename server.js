const express = require('express')
const app = express()
app.use("/", express.static("."));
app.use("/lib", express.static("node_modules"));

app.listen(3000, function () {
  console.log('#demolished is serverd on port 3000!')
})