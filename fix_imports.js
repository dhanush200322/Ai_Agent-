const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const srcDir = path.join(__dirname, 'src');
const prismaDir = path.join(srcDir, 'shared', 'prisma');
const files = walk(srcDir);

files.forEach(file => {
  // Skip the shared prisma file itself
  if (file === path.join(prismaDir, 'index.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to catch variants of the import
  const importRegex = /import\s+\{\s*prisma\s*\}\s+from\s+['"]@shared\/prisma['"];?/g;
  const exportRegex = /export\s+\{\s*prisma\s*\}\s+from\s+['"]@shared\/prisma['"];?/g;

  if (importRegex.test(content) || exportRegex.test(content)) {
    // Calculate relative path
    const fileDir = path.dirname(file);
    let relativePath = path.relative(fileDir, prismaDir).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }

    content = content.replace(importRegex, `import { prisma } from '${relativePath}';`);
    content = content.replace(exportRegex, `export { prisma } from '${relativePath}';`);
    
    fs.writeFileSync(file, content);
    console.log(`Updated imports in ${file} to ${relativePath}`);
  }
});
