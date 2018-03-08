const express = require('express')
const app = express()
app.use("/demolished", express.static("."));
app.use("/vendor", express.static("node_modules"));
app.use("/libs", express.static("libs"));


app.listen(3000, function () {
  console.log('#demolished is serverd on port 3000!')
})