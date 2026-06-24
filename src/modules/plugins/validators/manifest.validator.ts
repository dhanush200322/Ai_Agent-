import { PluginManifest } from '../sdk/plugin-manifest';

export class ManifestValidator {
  
  static validate(manifest: any): PluginManifest {
    if (!manifest.id || !manifest.version) {
      throw new Error('Manifest validation failed: Missing id or version');
    }

    if (!manifest.minimumPlatformVersion) {
      throw new Error('Manifest validation failed: Missing minimumPlatformVersion');
    }

    if (!manifest.signature || !manifest.checksum) {
      throw new Error('Manifest validation failed: Untrusted plugin. Signature and Checksum are required.');
    }

    if (!manifest.permissions) manifest.permissions = [];
    if (!manifest.tools) manifest.tools = [];
    if (!manifest.workflowNodes) manifest.workflowNodes = [];
    if (!manifest.agentCapabilities) manifest.agentCapabilities = [];
    if (!manifest.connectors) manifest.connectors = [];
    if (!manifest.dependencies) manifest.dependencies = {};

    return manifest as PluginManifest;
  }

  static verifySignature(manifest: PluginManifest, providedSignature: string): boolean {
    // In a production scenario, we would use crypto.verify with the publisher's public key
    // For this engine validation, we ensure they match exactly or enforce a strict signature logic
    if (manifest.signature !== providedSignature) {
      throw new Error('Signature verification failed: Plugin package may be tampered with.');
    }
    return true;
  }

  static verifyPlatformCompatibility(manifest: PluginManifest, currentPlatform: string): boolean {
    // Simple naive semver check for scaffolding purposes
    const min = parseFloat(manifest.minimumPlatformVersion);
    const curr = parseFloat(currentPlatform);
    if (curr < min) {
      throw new Error(`Incompatible platform version. Plugin requires ${manifest.minimumPlatformVersion} but platform is ${currentPlatform}`);
    }
    if (manifest.maximumPlatformVersion) {
      const max = parseFloat(manifest.maximumPlatformVersion);
      if (curr > max) {
        throw new Error(`Incompatible platform version. Plugin max is ${manifest.maximumPlatformVersion}`);
      }
    }
    return true;
  }
}
