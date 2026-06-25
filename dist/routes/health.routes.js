"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApiResponse_1 = require("../shared/response/ApiResponse");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).json(ApiResponse_1.ApiResponse.success({ status: 'OK' }, 'Health check passed', req.reqId));
});
exports.default = router;
