"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';

export default function Risks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    fetchRisks();
  }, [classFilter]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const q = classFilter ? `?classId=${classFilter}` : '';
      const res = await fetch(`/api/principal/risks${q}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRisks(data.data || []);
      else alert(data.message || 'Error');
    } catch (err) {
      console.error(err);
      alert('Failed');
    } finally { setLoading(false); }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Student Risk Detector</h1>
        <div className="mb-4">
          <input placeholder="Filter by classId" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="p-2 border rounded mr-2" />
          <button onClick={fetchRisks} className="px-3 py-2 bg-blue-600 text-white rounded">Filter</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (<div>Loading...</div>) : risks.map((r) => (
            <div key={r._id} className="p-4 rounded shadow bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.studentId?.firstName} {r.studentId?.lastName}</div>
                  <div className="text-sm text-gray-500">Class: {r.studentId?.classId}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-white ${r.riskLevel === 'HIGH' ? 'bg-red-500' : r.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}>{r.riskLevel}</div>
              </div>
              <div className="mt-3">
                <ul className="list-disc ml-5 text-sm">
                  {r.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
