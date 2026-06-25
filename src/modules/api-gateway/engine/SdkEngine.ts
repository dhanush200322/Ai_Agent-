import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class SdkEngine {
  private readonly logger = new Logger(SdkEngine.name);

  async generateSdk(language: string, openApiSpecPath: string, outputDir: string) {
    this.logger.debug(`Generating ${language} SDK from ${openApiSpecPath}`);
    try {
      const command = `npx @openapitools/openapi-generator-cli generate -i ${openApiSpecPath} -g ${language} -o ${outputDir}`;
      await execAsync(command);
      this.logger.log(`Successfully generated ${language} SDK to ${outputDir}`);
      return { success: true, outputDir };
    } catch (error) {
      this.logger.error(`SDK generation failed for ${language}`, error);
      throw new Error(`Failed to generate SDK: ${error}`);
    }
  }
}
