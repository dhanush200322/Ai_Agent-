"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DocumentationEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationEngine = void 0;
const prisma_1 = require("../../../shared/prisma");
const common_1 = require("@nestjs/common");
let DocumentationEngine = DocumentationEngine_1 = class DocumentationEngine {
    logger = new common_1.Logger(DocumentationEngine_1.name);
    prisma = prisma_1.prisma;
    async getOpenApiSpec(version = '1.0.0') {
        this.logger.debug(`Generating OpenAPI spec for version ${version}`);
        return {
            openapi: '3.1.0',
            info: {
                title: 'Nexora AI API',
                version: version,
                description: 'Public APIs for the Nexora AI'
            },
            servers: [
                { url: 'https://api.enterprise-agent.com/v1' }
            ],
            paths: {
                '/agents': {
                    get: {
                        summary: 'List agents',
                        responses: {
                            '200': { description: 'Successful response' }
                        }
                    }
                }
            }
        };
    }
};
exports.DocumentationEngine = DocumentationEngine;
exports.DocumentationEngine = DocumentationEngine = DocumentationEngine_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentationEngine);
