"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = void 0;
const getHealthStatus = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Vantra API is running'
    });
};
exports.getHealthStatus = getHealthStatus;
