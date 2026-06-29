const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'frontend', 'src');

const dirs = [
  'app/(auth)',
  'app/(dashboard)',
  'app/api',
  'components/ui',
  'components/layout',
  'components/common',
  'components/forms',
  'components/charts',
  'components/feedback',
  'features/auth',
  'features/dashboard',
  'features/agents',
  'features/chat',
  'features/knowledge',
  'features/workflow',
  'features/queue',
  'features/marketplace',
  'features/billing',
  'features/enterprise',
  'features/vault',
  'features/analytics',
  'features/health',
  'features/settings',
  'services/api',
  'services/auth',
  'services/agents',
  'services/chat',
  'services/knowledge',
  'services/workflow',
  'services/queue',
  'services/billing',
  'services/marketplace',
  'services/enterprise',
  'services/vault',
  'services/analytics',
  'services/health',
  'services/settings',
  'hooks',
  'providers',
  'store',
  'lib',
  'types',
  'utils',
  'constants',
  'config',
  'assets',
  'styles'
];

const files = {
  'app/globals.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
  'app/layout.tsx': 'export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html><body>{children}</body></html>); }\n',
  'app/loading.tsx': 'export default function Loading() { return <div>Loading...</div>; }\n',
  'app/not-found.tsx': 'export default function NotFound() { return <div>Not Found</div>; }\n',
  'app/page.tsx': 'export default function Page() { return <div>Home</div>; }\n',
};

// Create dirs
dirs.forEach(d => {
  fs.mkdirSync(path.join(root, d), { recursive: true });
});

// Create files
Object.entries(files).forEach(([f, content]) => {
  const filePath = path.join(root, f);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
});

console.log("Structure created successfully in frontend/src");
