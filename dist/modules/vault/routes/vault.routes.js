"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vault_controller_1 = require("../controllers/vault.controller");
const auth_1 = require("../../../middleware/auth");
const authorize_1 = require("../../../middleware/authorize");
const router = (0, express_1.Router)();
const controller = new vault_controller_1.VaultController();
router.use(auth_1.authenticate);
router.post('/', (0, authorize_1.authorize)('vault:write'), controller.storeSecret.bind(controller));
router.get('/', (0, authorize_1.authorize)('vault:view'), controller.listSecrets.bind(controller));
router.get('/stats', (0, authorize_1.authorize)('vault:view'), controller.getStats?.bind(controller) || ((req, res) => res.json({})));
router.get('/:id', (0, authorize_1.authorize)('vault:view'), controller.retrieveSecret.bind(controller));
router.post('/:id/rotate', (0, authorize_1.authorize)('vault:write'), controller.rotateSecret.bind(controller));
router.delete('/:id', (0, authorize_1.authorize)('vault:write'), controller.revokeSecret.bind(controller));
// Leases
router.post('/:id/lease', (0, authorize_1.authorize)('vault:write'), controller.createLease.bind(controller));
router.get('/lease/:leaseId', (0, authorize_1.authorize)('vault:view'), controller.retrieveLease.bind(controller));
exports.default = router;
