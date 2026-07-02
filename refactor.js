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

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  // Skip the shared prisma file itself
  if (file.includes('shared\\prisma\\index.ts') || file.includes('shared/prisma/index.ts')) return;

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Pattern 1: Module-level const prisma = new PrismaClient();
  const pattern1 = /const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*(as\s+any)?\s*;/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, '');
    if (!content.includes("import { prisma } from '@shared/prisma'")) {
        content = "import { prisma } from '@shared/prisma';\n" + content;
    }
    changed = true;
  }

  // Pattern 2: Class-level private readonly prisma = new PrismaClient();
  const pattern2 = /private\s+(readonly\s+)?prisma\s*=\s*new\s+PrismaClient\(\)\s*;/g;
  if (pattern2.test(content)) {
     content = content.replace(pattern2, 'private readonly prisma = prisma;');
     if (!content.includes("import { prisma } from '@shared/prisma'")) {
        content = "import { prisma } from '@shared/prisma';\n" + content;
     }
     changed = true;
  }
  
  // Pattern 3: export const prisma = new PrismaClient();
  const pattern3 = /export\s+const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;/g;
  if (pattern3.test(content)) {
      content = content.replace(pattern3, "export { prisma } from '@shared/prisma';");
      changed = true;
  }

  // Pattern 4: let prisma = new PrismaClient();
  const pattern4 = /let\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;/g;
  if (pattern4.test(content)) {
      content = content.replace(pattern4, '');
      if (!content.includes("import { prisma } from '@shared/prisma'")) {
          content = "import { prisma } from '@shared/prisma';\n" + content;
      }
      changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
