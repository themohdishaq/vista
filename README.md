# Field Inventory Management System

Enterprise Warehouse Control, Supply Chain Orchestration & Precision Field Logistics.

## Overview

The **Field Inventory Management System** is a unified multi-depot web application providing end-to-end inventory tracking, segregation of operational duties, and real-time database synchronization.

### System Roles & Portals
- **Administrator (`/admin`)**: Master catalog, user access control, facility management, and executive analytics.
- **Inventory Manager (`/manager`)**: Stock balances, review & approval workflows (requisitions, adjustments, transfers), batch/expiry monitoring, and discrepancy audits.
- **Warehouse Floor Specialist (`/staff`)**: Dock receiving, item picking & ward dispensing, bin transfers, kit packing, and physical cycle counts.
- **Public & Authentication (`/`, `/about`, `/login`)**: Public overview, marketing showcase, and intelligent single-sign-on role router.

## Getting Started

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
