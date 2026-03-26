'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/authStore';
import {
  loadAdminDisputesList,
  statusLabel,
  typeLabel,
} from '@/lib/admin-dispute-detail';
import type { DashboardDispute } from '@/lib/dashboard-data';
import { Gavel, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDisputesDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<DashboardDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.replace('/landlords');
    }
  }, [authLoading, user?.role, router]);

  useEffect(() => {
    if (authLoading || user?.role !== 'admin') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadAdminDisputesList();
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setError('Could not load disputes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-blue-200/80">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Gavel className="text-amber-400" size={28} />
            Disputes
          </h1>
          <p className="text-blue-200/60 mt-1 text-sm max-w-xl">
            Open a case to review evidence, timeline, and record a resolution.
          </p>
        </div>
        <a
          href="https://t.me/chiomagroup"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-sky-300/90 hover:text-sky-200 underline underline-offset-4"
        >
          Community: Telegram support
        </a>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex justify-center py-20 text-blue-200/80">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : error ? (
          <p className="p-8 text-red-400 text-center">{error}</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-slate-500 text-center">No disputes found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-semibold">Case</th>
                  <th className="px-5 py-4 font-semibold hidden md:table-cell">
                    Property
                  </th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold hidden sm:table-cell">
                    Updated
                  </th>
                  <th className="px-5 py-4 font-semibold w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{row.disputeId}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {typeLabel(row.disputeType)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 hidden md:table-cell max-w-[220px] truncate">
                      {row.propertyName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10">
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 hidden sm:table-cell whitespace-nowrap">
                      {format(new Date(row.updatedAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/disputes/${row.id}`}
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                      >
                        View
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
