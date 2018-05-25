const express = require('express')
const app = express()
app.use("/demolished", express.static("."));
app.use("/vendor", express.static("node_modules"));
app.use("/build", express.static("build"));
app.use("/libs", express.static("libs"));


app.listen(3000, function () {
  console.log('#now serving v.0.3 ProjectSara a SEED Team mod on port 3000. ')
})