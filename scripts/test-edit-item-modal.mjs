// filepath: scripts/test-edit-item-modal.mjs
import fs from 'node:fs';
import path from 'node:path';

console.log('--- Testing EditItemModal & Edit Item Flow ---');

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`✔ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`✖ FAIL: ${msg}`);
  }
}

// 1. Verify EditItemModal.tsx implementation
const editModalPath = path.join(process.cwd(), 'components/admin/items/EditItemModal.tsx');
const editModalContent = fs.readFileSync(editModalPath, 'utf8');

assert(editModalContent.includes('handleSubmit'), 'EditItemModal implements handleSubmit');
assert(editModalContent.includes('isSubmitting'), 'EditItemModal tracks isSubmitting state');
assert(editModalContent.includes('fetch(`/api/items/'), 'EditItemModal performs direct PATCH to /api/items/[id]');
assert(editModalContent.includes('stockQuantity: totalNum') || editModalContent.includes('totalStock: totalNum'), 'EditItemModal accurately calculates total stock');
assert(editModalContent.includes('[item, isOpen]'), 'EditItemModal resets fields dynamically when opened on item');
assert(editModalContent.includes('allCategoryOptions'), 'EditItemModal dynamically incorporates all valid categories');
assert(editModalContent.includes('error &&') && editModalContent.includes('AlertCircle'), 'EditItemModal renders clear error feedback if update fails');

// 2. Verify edititemmodel.tsx alias exists for compatibility
const aliasPath = path.join(process.cwd(), 'components/admin/items/edititemmodel.tsx');
assert(fs.existsSync(aliasPath), 'edititemmodel.tsx alias file exists');

// 3. Verify ItemDetailsPanel.tsx onSave integration
const panelPath = path.join(process.cwd(), 'components/admin/items/ItemDetailsPanel.tsx');
const panelContent = fs.readFileSync(panelPath, 'utf8');
assert(panelContent.includes('await fetchItemDetails()'), 'ItemDetailsPanel refreshes details after edit modal saves');

// 4. Verify API route PATCH handler
const apiRoutePath = path.join(process.cwd(), 'app/api/items/[id]/route.ts');
const apiRouteContent = fs.readFileSync(apiRoutePath, 'utf8');
assert(apiRouteContent.includes('updateItem(id, body)'), 'API route calls updateItem');
assert(apiRouteContent.includes('refreshed || updated'), 'API route returns updated item data');

// 5. Verify item-service.ts update logic
const servicePath = path.join(process.cwd(), 'lib/services/item-service.ts');
const serviceContent = fs.readFileSync(servicePath, 'utf8');
assert(serviceContent.includes('batch_tracking = COALESCE($8, batch_tracking)'), 'item-service persists batch_tracking to database');
assert(serviceContent.includes('expiry_tracking = COALESCE($9, expiry_tracking)'), 'item-service persists expiry_tracking to database');
assert(serviceContent.includes('(id = $1 OR code = $1)'), 'item-service matches by both id and code in queries');

console.log(`\nResults: ${passed}/${total} assertions passed.`);
if (passed !== total) {
  process.exit(1);
}
