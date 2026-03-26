'use client';

import { RoleManagement } from '@/components/admin/RoleManagement';

export default function AdminRolesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 sm:p-6 lg:p-8">
      <RoleManagement />
    </div>
  );
}
