import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, match) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      res = res.concat(getFiles(full, match));
    } else if (match(full)) {
      res.push(full);
    }
  });
  return res;
}

const baseDir = process.cwd();
const pages = getFiles(path.join(baseDir, 'app'), f => f.endsWith('page.tsx'))
  .map(f => {
    let rel = path.relative(path.join(baseDir, 'app'), f).replace(/\\/g, '/');
    rel = rel.replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, '');
    return '/' + rel;
  })
  .sort();

const apis = getFiles(path.join(baseDir, 'app', 'api'), f => f.endsWith('route.ts'))
  .map(f => {
    let rel = path.relative(path.join(baseDir, 'app', 'api'), f).replace(/\\/g, '/');
    rel = rel.replace(/\/route\.ts$/, '');
    return '/api/' + rel;
  })
  .sort();

const components = getFiles(path.join(baseDir, 'components'), f => f.endsWith('.tsx'))
  .map(f => path.relative(path.join(baseDir, 'components'), f).replace(/\\/g, '/'))
  .sort();

const output = {
  totalPages: pages.length,
  pages,
  totalApis: apis.length,
  apis,
  totalComponents: components.length,
  components
};

console.log(`=== PAGES (${pages.length}) ===`);
pages.forEach(p => console.log(`PAGE: ${p}`));

console.log(`\n=== APIS (${apis.length}) ===`);
apis.forEach(a => console.log(`API: ${a}`));

console.log(`\n=== COMPONENTS (${components.length}) ===`);
components.forEach(c => console.log(`COMPONENT: ${c}`));

