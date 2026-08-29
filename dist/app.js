"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Basic Middleware
app.use(express_1.default.json());
// Routes
app.use('/api/health', health_routes_1.default);
// Error Handling Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
