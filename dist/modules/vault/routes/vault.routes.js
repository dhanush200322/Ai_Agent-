"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vault_controller_1 = require("../controllers/vault.controller");
const uuid_1 = require("uuid");
// Mock auth middleware for the prototype
const authMiddleware = (req, _res, next) => {
    req.user = {
        id: (0, uuid_1.v4)(),
        organizationId: '00000000-0000-0000-0000-000000000001'
    };
    next();
};
const router = (0, express_1.Router)();
const controller = new vault_controller_1.VaultController();
router.post('/', authMiddleware, controller.storeSecret.bind(controller));
router.get('/', authMiddleware, controller.listSecrets.bind(controller));
router.get('/:id', authMiddleware, controller.retrieveSecret.bind(controller));
router.post('/:id/rotate', authMiddleware, controller.rotateSecret.bind(controller));
router.delete('/:id', authMiddleware, controller.revokeSecret.bind(controller));
// Leases
router.post('/:id/lease', authMiddleware, controller.createLease.bind(controller));
router.get('/lease/:leaseId', authMiddleware, controller.retrieveLease.bind(controller));
exports.default = router;
