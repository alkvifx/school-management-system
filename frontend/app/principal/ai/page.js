"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { ROLES } from "@/src/utils/constants";
import { aiService } from "@/src/services/ai.service";
import VoiceInput from '@/src/components/VoiceInput.jsx';

export default function PrincipalAI() {
  const [form, setForm] = useState({ schoolType: "CBSE", classes: "1-12", tone: "formal", language: "English", purpose: "website" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [school, setSchool] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    const init = async () => {
      try {
        const s = await (await import('@/src/services/principal.service')).principalService.getSchool();
        setSchool(s.data || s);
        const res = await aiService.getTemplates(token);
        if (res.success) setTemplates(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await aiService.generateTemplate(form, token);
      if (res.success) {
        setResult(res.data);
        setTemplates((t) => [res.data, ...t]);
      } else {
        alert(res.message || 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    try {
      const text = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (err) {
      alert('Copy failed');
    }
  };

  const download = async (format = 'pdf') => {
    try {
      const res = await aiService.downloadTemplate(result._id, format, token);
      if (!res.ok) return alert('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${result.templateType}.${format === 'pdf' ? 'pdf' : 'doc'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Download failed');
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">AI Principal Command Center</h1>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">School Template Generator</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select name="schoolType" value={form.schoolType} onChange={handleChange} className="p-2 border rounded">
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
              </select>
              <input name="classes" value={form.classes} onChange={handleChange} className="p-2 border rounded" />
              <select name="tone" value={form.tone} onChange={handleChange} className="p-2 border rounded">
                <option>formal</option>
                <option>modern</option>
              </select>
              <select name="language" value={form.language} onChange={handleChange} className="p-2 border rounded">
                <option>English</option>
                <option>Hindi</option>
              </select>
              <select name="purpose" value={form.purpose} onChange={handleChange} className="p-2 border rounded">
                <option value="website">Website</option>
                <option value="notice">Notice</option>
                <option value="prospectus">Prospectus</option>
                <option value="admission">Admission Text</option>
                <option value="annual_report">Annual Report</option>
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || (school && school.plan === 'FREE')}>{loading ? 'Generating...' : 'Generate'}</button>
              <button onClick={copyText} className="px-4 py-2 bg-gray-100 rounded">Copy</button>
              <button onClick={() => download('pdf')} className="px-4 py-2 bg-gray-100 rounded">Download PDF</button>
              <button onClick={() => download('doc')} className="px-4 py-2 bg-gray-100 rounded">Download DOC</button>
            </div>
            {school && school.plan === 'FREE' && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Upgrade required:</strong> AI Templates are available on <span className="font-semibold">PRO</span> plan. <a href="/principal/settings" className="underline">Upgrade now</a>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-medium">Preview</h3>
              <pre className="bg-gray-50 p-3 rounded mt-2 max-h-96 overflow-auto">{result ? (typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2)) : 'No content yet'}</pre>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">AI Notice Writer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <input placeholder="Event (PTM)" id="event" className="p-2 border rounded" />
                <input type="date" id="date" className="p-2 border rounded" />
                <input placeholder="Classes (comma separated)" id="classes" className="p-2 border rounded" />
                <select id="language" className="p-2 border rounded">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={async () => {
                  const event = document.getElementById('event').value;
                  const date = document.getElementById('date').value;
                  const classes = document.getElementById('classes').value.split(',').map(s => s.trim()).filter(Boolean);
                  const language = document.getElementById('language').value;
                  const payload = { event, date, classes, language, delivery: ['notice','whatsapp','sms'] };
                  setLoading(true);
                  try {
                    const res = await aiService.generateNotice(payload, token);
                    if (res.success) {
                      alert('Notice generated and saved');
                    } else {
                      alert('Error: ' + (res.message || ''));
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Failed');
                  } finally { setLoading(false); }
                }} className="px-3 py-2 bg-green-600 text-white rounded" disabled={school && school.plan === 'FREE'}>Generate Notice</button>
                <button onClick={async () => { const res = await aiService.getNotices(token); if (res.success) alert(JSON.stringify(res.data[0]?.generated || {})); }} className="px-3 py-2 bg-gray-100 rounded">View Latest</button>
                <div className="ml-auto">
                  <VoiceInput onResult={(text) => { document.getElementById('event').value = text; }} />
                </div>
              </div>
              {school && school.plan === 'FREE' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>Upgrade required:</strong> AI Notices are available on <span className="font-semibold">PRO</span> plan. <a href="/principal/settings" className="underline">Upgrade now</a>
                </div>
              )}

              {/* AI Poster Generator */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold">AI Poster / Status Generator</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <input placeholder="Text (e.g. Happy Independence Day)" id="posterText" className="p-2 border rounded" />
                  <input placeholder="Occasion (optional)" id="posterOccasion" className="p-2 border rounded" />
                  <select id="posterFormat" className="p-2 border rounded">
                    <option value="story">Instagram Story (9:16)</option>
                    <option value="poster">Poster (1:1)</option>
                    <option value="banner">Banner (16:9)</option>
                  </select>
                  <input id="posterImage" type="file" accept="image/*" className="p-2" />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={async () => {
                    if (school && school.plan === 'FREE') return alert('Upgrade to PRO to use AI Poster Generator');
                    const text = document.getElementById('posterText').value.trim();
                    const occasion = document.getElementById('posterOccasion').value.trim();
                    const format = document.getElementById('posterFormat').value;
                    const fileInput = document.getElementById('posterImage');
                    if (!text || !format) return alert('Text and format are required');
                    const fd = new FormData();
                    fd.append('text', text);
                    fd.append('occasion', occasion);
                    fd.append('format', format);
                    if (fileInput.files && fileInput.files[0]) fd.append('image', fileInput.files[0]);
                    setLoading(true);
                    try {
                      const res = await aiService.generatePoster(fd, token);
                      if (res.success) {
                        alert('Poster generated');
                        // show preview by setting result
                        setResult({ content: { poster: res.data } });
                      } else {
                        alert(res.message || 'Failed');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('Generation failed');
                    } finally { setLoading(false); }
                  }} className="px-3 py-2 bg-indigo-600 text-white rounded" disabled={loading}>Generate Poster</button>

                  <button onClick={async () => { const res = await aiService.getPosters(token); if (res.success) { const p = res.data[0]; if (p) { setResult({ content: { poster: p } }); alert('Latest poster loaded'); } else alert('No posters yet'); } else alert('Error'); }} className="px-3 py-2 bg-gray-100 rounded">View Latest</button>
                  <div className="ml-auto">
                    <small className="text-sm text-gray-500">Formats: Story / Poster / Banner</small>
                  </div>
                </div>

                <div className="mt-4">
                  {result?.content?.poster ? (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-50 p-2 rounded">
                        <img src={result.content.poster.imageUrl} alt="Generated poster" className="w-full h-auto rounded" />
                      </div>
                      <div className="flex gap-2">
                        <a href={result.content.poster.imageUrl} download className="px-3 py-2 bg-gray-100 rounded">Download</a>
                        <button onClick={async () => {
                          // regenerate with same prompt
                          if (school && school.plan === 'FREE') return alert('Upgrade required');
                          const fd = new FormData();
                          fd.append('text', result.content.poster.promptUsed.split('\n')[0] || '');
                          fd.append('format', result.content.poster.format || 'poster');
                          setLoading(true);
                          try {
                            const res = await aiService.generatePoster(fd, token);
                            if (res.success) {
                              setResult({ content: { poster: res.data } });
                              alert('Regenerated');
                            } else alert('Failed');
                          } catch (err) {
                            console.error(err);
                            alert('Failed');
                          } finally { setLoading(false); }
                        }} className="px-3 py-2 bg-yellow-500 text-white rounded">Regenerate</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No poster generated yet.</div>
                  )}
                </div>

                {school && school.plan === 'FREE' && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Upgrade required:</strong> AI Posters are available on <span className="font-semibold">PRO</span> plan. <a href="/principal/settings" className="underline">Upgrade now</a>
                  </div>
                )}

              </div>
            </div>
          </div>

          <aside className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-3">Saved Templates</h3>
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t._id} className="border p-2 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{t.templateType}</div>
                      <div className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={async () => { const res = await aiService.downloadTemplate(t._id, 'pdf', token); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `template-${t.templateType}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }} className="px-2 py-1 bg-gray-100 rounded text-sm">PDF</button>
                      <button onClick={async () => { setResult(t); }} className="px-2 py-1 bg-gray-50 rounded text-sm">Preview</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

      </div>
    </ProtectedRoute>
  );
}
