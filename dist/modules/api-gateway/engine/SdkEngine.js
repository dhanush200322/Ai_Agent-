"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SdkEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkEngine = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let SdkEngine = SdkEngine_1 = class SdkEngine {
    logger = new common_1.Logger(SdkEngine_1.name);
    async generateSdk(language, openApiSpecPath, outputDir) {
        this.logger.debug(`Generating ${language} SDK from ${openApiSpecPath}`);
        try {
            const command = `npx @openapitools/openapi-generator-cli generate -i ${openApiSpecPath} -g ${language} -o ${outputDir}`;
            await execAsync(command);
            this.logger.log(`Successfully generated ${language} SDK to ${outputDir}`);
            return { success: true, outputDir };
        }
        catch (error) {
            this.logger.error(`SDK generation failed for ${language}`, error);
            throw new Error(`Failed to generate SDK: ${error}`);
        }
    }
};
exports.SdkEngine = SdkEngine;
exports.SdkEngine = SdkEngine = SdkEngine_1 = __decorate([
    (0, common_1.Injectable)()
], SdkEngine);
