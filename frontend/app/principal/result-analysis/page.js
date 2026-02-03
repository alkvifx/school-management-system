"use client";

import { useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ResultAnalysis() {
  const [exam, setExam] = useState('final');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/result-analysis/${exam}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
      else alert(data.message || 'Error');
    } catch (err) {
      console.error(err);
      alert('Failed');
    } finally { setLoading(false); }
  };

  const chartData = (analysis?.weakSubjects || []).map((s) => ({ subject: s.name || s, score: s.avg?.toFixed ? s.avg : 0 }));

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">AI Result Analysis</h1>
        <div className="flex gap-2 items-center mb-4">
          <select value={exam} onChange={(e) => setExam(e.target.value)} className="p-2 border rounded">
            <option value="unit_test">Unit Test</option>
            <option value="mid_term">Mid Term</option>
            <option value="final">Final</option>
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>
          <button onClick={fetchAnalysis} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Analyzing...' : 'Analyze'}</button>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p>{analysis.summary || '—'}</p>
              <h4 className="mt-4 font-medium">Teacher Insights</h4>
              <ul className="list-disc ml-6 mt-2">
                {(analysis.teacherInsights || []).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Weak Subjects</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <h4 className="mt-4 font-medium">At-risk Students</h4>
              <ul className="list-disc ml-6 mt-2">
                {(analysis.atRiskStudents || []).map((s, i) => <li key={i}>{s.studentId ? s.studentId : s.name} - {s.reason || s.reasons?.join(', ')}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
