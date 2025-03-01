"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var path_1 = require("path");
// Load .env from parent directory
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, "..", ".env") });
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.get("/", function (req, res) {
    res.send("Welcome to the Crosswords API!");
});
app.listen(PORT, function () {
    console.log("Server is running at http://localhost:".concat(PORT));
});
