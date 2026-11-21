import fs from 'node:fs';
import path from 'node:path';

function writeWithRetry(p, data) {
  for (let i = 0; i < 10; i++) {
    try {
      fs.writeFileSync(p, data, 'utf-8');
      return;
    } catch (e) {
      if (i === 9) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    }
  }
}

// 1. Clean stock-service.ts
{
  const p = path.join(process.cwd(), 'lib', 'services', 'stock-service.ts');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /function initRuntimeAdjustments\(\): AdjustmentRecord\[\] \{[\s\S]*?return globalThis\.__vista_runtime_adjustments__!;\s*\}/m,
    `function initRuntimeAdjustments(): AdjustmentRecord[] {
  if (!globalThis.__vista_runtime_adjustments__) {
    globalThis.__vista_runtime_adjustments__ = [];
  }
  return globalThis.__vista_runtime_adjustments__!;
}`
  );
  writeWithRetry(p, content);
  console.log('Cleaned stock-service.ts adjustments seed.');
}

// 2. Clean request-service.ts
{
  const p = path.join(process.cwd(), 'lib', 'services', 'request-service.ts');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /function initRuntimeRequests\(\): StockRequestRecord\[\] \{[\s\S]*?return globalThis\.__vista_runtime_requests__;\s*\}/m,
    `function initRuntimeRequests(): StockRequestRecord[] {
  if (!globalThis.__vista_runtime_requests__) {
    globalThis.__vista_runtime_requests__ = [];
  }
  return globalThis.__vista_runtime_requests__;
}`
  );
  writeWithRetry(p, content);
  console.log('Cleaned request-service.ts requests seed.');
}

// 3. Clean transfer-service.ts
{
  const p = path.join(process.cwd(), 'lib', 'services', 'transfer-service.ts');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /function initRuntimeTransfers\(\): TransferRecord\[\] \{[\s\S]*?return globalThis\.__vista_runtime_transfers__;\s*\}/m,
    `function initRuntimeTransfers(): TransferRecord[] {
  if (!globalThis.__vista_runtime_transfers__) {
    globalThis.__vista_runtime_transfers__ = [];
  }
  return globalThis.__vista_runtime_transfers__;
}`
  );
  writeWithRetry(p, content);
  console.log('Cleaned transfer-service.ts transfers seed.');
}

// 4. Clean incident-service.ts
{
  const p = path.join(process.cwd(), 'lib', 'services', 'incident-service.ts');
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(
    /function initRuntimeIncidents\(\): IncidentRecord\[\] \{[\s\S]*?return globalThis\.__vista_runtime_incidents__;\s*\}/m,
    `function initRuntimeIncidents(): IncidentRecord[] {
  if (!globalThis.__vista_runtime_incidents__) {
    globalThis.__vista_runtime_incidents__ = [];
  }
  return globalThis.__vista_runtime_incidents__;
}`
  );
  content = content.replace(
    /function initRuntimePurchases\(\): LocalPurchaseRecord\[\] \{[\s\S]*?return globalThis\.__vista_runtime_purchases__;\s*\}/m,
    `function initRuntimePurchases(): LocalPurchaseRecord[] {
  if (!globalThis.__vista_runtime_purchases__) {
    globalThis.__vista_runtime_purchases__ = [];
  }
  return globalThis.__vista_runtime_purchases__;
}`
  );
  writeWithRetry(p, content);
  console.log('Cleaned incident-service.ts incidents and purchases seeds.');
}
