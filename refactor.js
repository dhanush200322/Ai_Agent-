const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace (req as any).reqId with req.reqId
    content = content.replace(/\(req as any\)\.reqId/g, 'req.reqId');
    
    // Replace (req as any).sessionId with req.sessionId
    content = content.replace(/\(req as any\)\.sessionId/g, 'req.sessionId');

    // Replace (req as any).user with req.user!
    // because auth middleware guarantees it if they are using it
    // Wait, for optional chaining like (req as any).user?.id, we can just replace with req.user?.id
    content = content.replace(/\(req as any\)\.user\?\./g, 'req.user?.');
    
    // For (req as any).user.property, replace with req.user!.property
    content = content.replace(/\(req as any\)\.user\./g, 'req.user!.');
    
    // For standalone (req as any).user, replace with req.user!
    // But be careful not to break (req as any).user?. which we already replaced above
    content = content.replace(/\(req as any\)\.user/g, 'req.user!');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
