"use client";

import { useState, useMemo, useEffect } from "react";
import { signIn, useSession, signOut } from "next-auth/react";

// --- MAIN APP ROUTER ---
export default function App() {
  const { status } = useSession();
  const [currentView, setCurrentView] = useState<'guest' | 'login' | 'signup' | 'dashboard'>('guest');

  // Auto-route logged-in users directly to the dashboard
  useEffect(() => {
    if (status === "authenticated" && currentView !== 'dashboard') {
      setCurrentView('dashboard');
    }
  }, [status, currentView]);

  if (currentView === 'login') return <AuthView setView={setCurrentView} type="login" />;
  if (currentView === 'signup') return <AuthView setView={setCurrentView} type="signup" />;
  if (currentView === 'dashboard') return <PremiumDashboardView setView={setCurrentView} />;
  return <GuestView setView={setCurrentView} />;
}

// ==========================================
// VIEW 1: GUEST DASHBOARD 
// ==========================================
function GuestView({ setView }: { setView: (v: any) => void }) {
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string; grade: string; units: string }>>([]);
  const [targetGwa, setTargetGwa] = useState("");
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetGwa);
  const [displayGwa, setDisplayGwa] = useState("0.0000");

  const addSubject = () => setSubjects([...subjects, { id: Date.now(), name: "", grade: "", units: "" }]);
  const updateSubject = (id: number, field: string, value: string) => setSubjects(subjects.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub)));
  const removeSubject = (id: number) => setSubjects(subjects.filter((sub) => sub.id !== id));

  const saveTarget = () => {
    const num = parseFloat(tempTarget);
    if (!isNaN(num) && num > 0) setTargetGwa(num.toFixed(2));
    else setTargetGwa("");
    setIsEditingTarget(false);
  };

  const { totalUnits, gwa, bestSubject, worstSubject } = useMemo(() => {
    let units = 0; let points = 0; let validSubjects: any[] = [];
    subjects.forEach((sub) => {
      const g = parseFloat(sub.grade); const u = parseFloat(sub.units);
      if (!isNaN(g) && !isNaN(u) && u > 0) { units += u; points += g * u; if (sub.name) validSubjects.push({ ...sub, numGrade: g }); }
    });
    validSubjects.sort((a, b) => a.numGrade - b.numGrade);
    return {
      totalUnits: units,
      gwa: units > 0 ? (points / units).toFixed(4) : "0.0000",
      bestSubject: validSubjects.length > 0 ? validSubjects[0] : null,
      worstSubject: validSubjects.length > 1 ? validSubjects[validSubjects.length - 1] : null,
    };
  }, [subjects]);

  useEffect(() => {
    if (gwa === "0.0000") { setDisplayGwa("0.0000"); return; }
    let start = parseFloat(displayGwa) || 0; let end = parseFloat(gwa);
    let startTime = performance.now();
    const animate = (currentTime: number) => {
      let progress = Math.min((currentTime - startTime) / 600, 1);
      setDisplayGwa((start + (end - start) * (1 - Math.pow(1 - progress, 4))).toFixed(4));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [gwa]);

  const numericGwa = parseFloat(gwa);
  const numericTarget = parseFloat(targetGwa);
  const isOnTrack = numericGwa > 0 && !isNaN(numericTarget) && numericGwa <= numericTarget;

  let gwaConfig = { gradient: "from-slate-400 to-slate-600", text: "text-slate-800", bg: "bg-slate-100", dot: "bg-slate-400", message: "Awaiting input" };
  if (numericGwa > 0) {
    if (numericGwa <= 1.50) gwaConfig = { gradient: "from-emerald-400 to-teal-500", text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", message: "Excellent Standing" };
    else if (numericGwa <= 2.25) gwaConfig = { gradient: "from-amber-400 to-orange-500", text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500", message: "Good Standing" };
    else gwaConfig = { gradient: "from-rose-400 to-red-500", text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500", message: "Needs Improvement" };
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 selection:bg-indigo-100 font-sans">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <header className="flex justify-between items-center border-b border-slate-200/60 pb-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-[2px] p-1.5 bg-slate-900 rounded-[8px] shadow-sm">
               <div className="w-2.5 h-2.5 bg-white rounded-[2px]"></div>
               <div className="w-2.5 h-2.5 border-2 border-white/70 rounded-[2px]"></div>
               <div className="w-2.5 h-2.5 border-2 border-white/70 rounded-[2px]"></div>
               <div className="w-2.5 h-2.5 bg-indigo-500 rounded-[2px]"></div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">BentoGWA</h1>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100/50 border border-indigo-100 px-1.5 py-0.5 rounded-md hidden sm:inline-block">by Ced1e</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Guest Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('login')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors hidden sm:block">Log In</button>
            <button onClick={() => setView('signup')} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-95">
              Sign Up
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative overflow-hidden bg-white rounded-[24px] p-8 md:p-12 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col items-center text-center hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">Current GWA</p>
              <h2 className={`text-7xl md:text-8xl font-black tracking-tighter tabular-nums bg-gradient-to-br ${gwaConfig.gradient} bg-clip-text text-transparent pb-2 relative z-10 transition-all duration-500`}>{displayGwa}</h2>
              <div className={`mt-4 px-5 py-2 rounded-full flex items-center gap-2.5 transition-colors duration-500 ${gwaConfig.bg} relative z-10`}>
                <div className={`w-2.5 h-2.5 rounded-full ${gwaConfig.dot} animate-pulse`}></div>
                <p className={`text-sm font-bold ${gwaConfig.text}`}>{gwaConfig.message}</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Grades & Units</h3>
                <button onClick={() => setSubjects([])} className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">Clear All</button>
              </div>
              <div className="space-y-3">
                {subjects.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-sm font-medium text-slate-400">No subjects added yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                      <div className="col-span-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</div>
                      <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Grade</div>
                      <div className="col-span-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Units</div>
                    </div>
                    {subjects.map((subject, index) => (
                      <div key={subject.id} className="grid grid-cols-12 gap-3 items-center group animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="col-span-6 relative">
                          <input type="text" placeholder={`Subject ${index + 1}`} value={subject.name} onChange={(e) => updateSubject(subject.id, "name", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-medium placeholder:text-slate-300 hover:border-indigo-200" />
                        </div>
                        <div className="col-span-3">
                          <input type="number" step="0.25" placeholder="0.0" value={subject.grade} onChange={(e) => updateSubject(subject.id, "grade", e.target.value)} className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-bold tabular-nums hover:border-indigo-200" />
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <input type="number" placeholder="0" value={subject.units} onChange={(e) => updateSubject(subject.id, "units", e.target.value)} className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-medium tabular-nums hover:border-indigo-200" />
                        </div>
                        <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => removeSubject(subject.id)} className="text-slate-300 hover:text-rose-500 transition-transform hover:scale-125">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <button onClick={addSubject} className="mt-6 w-full py-4 bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 text-white text-sm font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2">
                Add Subject
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
            <div className="col-span-2 lg:col-span-1 bg-white rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target GWA</p>
                {numericGwa > 0 && !isNaN(numericTarget) && (
                  <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${isOnTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isOnTrack ? 'On Track' : 'Warning'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {isEditingTarget ? (
                  <input autoFocus type="number" step="0.05" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} onBlur={saveTarget} onKeyDown={(e) => e.key === 'Enter' && saveTarget()} className="w-24 font-black text-3xl border-b-2 border-indigo-500 outline-none bg-indigo-50 px-2 py-1 rounded-t-lg tabular-nums animate-in zoom-in-95 duration-200" />
                ) : (
                  <button onClick={() => setIsEditingTarget(true)} className="flex items-center gap-2 group transition-transform active:scale-95">
                    <span className="text-3xl font-black text-slate-800 tabular-nums">{targetGwa || "--"}</span>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                )}
              </div>
            </div>

            <div className="col-span-1 bg-white rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Units</p>
              <p className="text-4xl font-black text-slate-800 tabular-nums">{totalUnits}</p>
            </div>

            <div className="col-span-1 bg-white rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/60 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Insights</p>
              <div className="space-y-4">
                <div className="flex items-start gap-2 group">
                  <div className="mt-0.5 text-emerald-500 group-hover:-translate-y-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Strongest</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{bestSubject ? `${bestSubject.name || 'Unnamed'} (${bestSubject.grade})` : "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 group">
                  <div className="mt-0.5 text-rose-500 group-hover:translate-y-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Needs Focus</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{worstSubject ? `${worstSubject.name || 'Unnamed'} (${worstSubject.grade})` : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div onClick={() => setView('signup')} className="col-span-2 lg:col-span-1 relative overflow-hidden bg-slate-900 rounded-[20px] p-6 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
               <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Track Your Growth</h3>
                  <p className="text-sm font-medium text-slate-400 mb-5">Save your GWA across semesters and unlock analytics.</p>
                </div>
                <div className="inline-flex px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 w-fit items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Start Tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// VIEW 2 & 3: WIRED AUTHENTICATION 
// ==========================================
function AuthView({ setView, type }: { setView: (v: any) => void, type: 'login' | 'signup' }) {
  const isLogin = type === 'login';

  const [formData, setFormData] = useState({ name: "", course: "", university: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const res = await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
        if (res?.error) setErrorMsg(res.error);
        else setView('dashboard');
      } else {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) setErrorMsg(data.message || "Something went wrong.");
        else {
          const res = await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
          if (!res?.error) setView('dashboard');
        }
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex overflow-hidden min-h-[600px] animate-in zoom-in-95 duration-300">
        
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-20 -left-10 w-64 h-64 bg-indigo-500 rounded-2xl rotate-12 opacity-20 blur-sm group-hover:rotate-45 transition-transform duration-1000 ease-out"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-emerald-400 rounded-full opacity-20 blur-xl group-hover:scale-150 transition-transform duration-1000 ease-out"></div>
          <div className="relative z-10">
             <div className="grid grid-cols-2 gap-[2px] p-2 bg-white/10 backdrop-blur-md rounded-xl w-fit shadow-lg cursor-pointer hover:scale-110 transition-transform" onClick={() => setView('guest')}>
               <div className="w-4 h-4 bg-white rounded-sm"></div>
               <div className="w-4 h-4 border-2 border-white/70 rounded-sm"></div>
               <div className="w-4 h-4 border-2 border-white/70 rounded-sm"></div>
               <div className="w-4 h-4 bg-indigo-500 rounded-sm"></div>
             </div>
          </div>
          <div className="relative z-10 text-white">
            <h2 className="text-4xl font-black mb-4">Master Your Academic Journey.</h2>
            <p className="text-slate-400 text-lg">Track grades, predict targets, and unlock deep insights into your performance.</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">{isLogin ? "Welcome to BentoGWA" : "Create your account"}</h2>
            <p className="text-slate-500 text-sm font-medium">{isLogin ? "Please enter your details to sign in." : "Set up your profile to start tracking."}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <div className="bg-rose-50 text-rose-600 text-sm font-bold p-3 rounded-lg border border-rose-200 animate-in fade-in">{errorMsg}</div>}

            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                  <div className="mt-1 relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    <input required name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="e.g., John Doe" className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-indigo-200 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Course / Program</label>
                  <div className="mt-1 relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                    </span>
                    <input name="course" value={formData.course} onChange={handleInputChange} type="text" placeholder="e.g., BSIT" className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-indigo-200 outline-none transition-all" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="student@university.edu" className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-indigo-200 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="mt-1 relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input required name="password" value={formData.password} onChange={handleInputChange} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 hover:border-indigo-200 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition-colors">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 hover:shadow-lg hover:-translate-y-1 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-300 active:scale-95 flex justify-center items-center gap-2">
              {isLoading && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setView(isLogin ? 'signup' : 'login'); setErrorMsg(""); setFormData({name: "", course: "", university: "", email: "", password: ""}); setShowPassword(false); }} className="font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline transition-colors">
              {isLogin ? "Sign up" : "Log in"}
            </span>
          </p>

          <button onClick={() => setView('guest')} className="mt-6 text-xs font-semibold text-slate-400 hover:text-slate-700 text-center transition-colors">
            ← Back to Calculator
          </button>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// VIEW 4: PREMIUM ACCOUNT DASHBOARD (CLOUD SYNCED)
// ==========================================
function PremiumDashboardView({ setView }: { setView: (v: any) => void }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student";
  const userInitials = userName.includes(' ') 
    ? `${userName.split(' ')[0][0]}${userName.split(' ')[1][0]}` 
    : userName.substring(0, 2).toUpperCase();

  // Semesters start completely empty, pending cloud fetch
  const [semesters, setSemesters] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [profile, setProfile] = useState({
    name: userName,
    course: "University",
    university: "Student"
  });

  const [targetGwa, setTargetGwa] = useState("");
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetGwa);
  
  // State for accordion functionality
  const [expandedSemesterId, setExpandedSemesterId] = useState<number | null>(null);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [isCreatingSemesterId, setIsCreatingSemesterId] = useState<number | null>(null);
  
  // App State Modals
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportSems, setSelectedExportSems] = useState<number[]>([]);
  const [themeMode, setThemeMode] = useState<"Light" | "Dark">("Light");

  // Fetch from DB on mount
  useEffect(() => {
    if (session) {
      fetch("/api/semesters")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const formatted = data.map((d: any) => ({
               id: d._id,
               name: d.semesterName,
               subjects: d.subjects.map((s: any) => ({
                 id: s._id || Date.now() + Math.random(),
                 name: s.name,
                 grade: s.grade.toString(),
                 units: s.units.toString(),
               }))
            }));
            setSemesters(formatted);
          }
          setIsLoadingData(false);
        })
        .catch(err => {
          console.error("Failed to load semesters:", err);
          setIsLoadingData(false);
        });
    }
  }, [session]);

  // Push to cloud wrapper
  const syncToCloud = async (currentSemesters: any[]) => {
    try {
      await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semestersData: currentSemesters })
      });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const analytics = useMemo(() => {
    let totalUnits = 0; let totalPoints = 0; let allSubjects: any[] = [];
    const processedSemesters = semesters.map(sem => {
      let semUnits = 0; let semPoints = 0;
      sem.subjects.forEach((sub: any) => {
        const g = parseFloat(sub.grade); const u = parseFloat(sub.units);
        if (!isNaN(g) && !isNaN(u) && u > 0) {
          semUnits += u; semPoints += g * u; totalUnits += u; totalPoints += g * u;
          if (sub.name) allSubjects.push({ ...sub, numGrade: g, semName: sem.name });
        }
      });
      return { ...sem, gwa: semUnits > 0 ? (semPoints / semUnits).toFixed(4) : "0.0000", units: semUnits };
    });

    allSubjects.sort((a, b) => a.numGrade - b.numGrade);
    const cumulative = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(4) : "0.0000";

    return {
      processedSemesters, cumulative, totalUnits,
      bestSubject: allSubjects.length > 0 ? allSubjects[0] : null,
      worstSubject: allSubjects.length > 1 ? allSubjects[allSubjects.length - 1] : null,
    };
  }, [semesters]);

  const saveTarget = () => {
    const num = parseFloat(tempTarget);
    if (!isNaN(num) && num > 0) setTargetGwa(num.toFixed(2));
    else setTargetGwa("");
    setIsEditingTarget(false);
  };

  const updateEditingSubject = (semId: number, subId: number, field: string, value: string) => {
    setSemesters(semesters.map(sem => sem.id === semId ? { ...sem, subjects: sem.subjects.map((sub: any) => sub.id === subId ? { ...sub, [field]: value } : sub) } : sem));
  };
  const removeEditingSubject = (semId: number, subId: number) => {
    setSemesters(semesters.map(sem => sem.id === semId ? { ...sem, subjects: sem.subjects.filter((s: any) => s.id !== subId) } : sem));
  };
  const addEditingSubject = (semId: number) => {
    setSemesters(semesters.map(sem => sem.id === semId ? { ...sem, subjects: [...sem.subjects, { id: Date.now(), name: "", grade: "", units: "", tag: "" }] } : sem));
  };
  
  const addNewSemester = () => {
    if (editingSemesterId !== null || isCreatingSemesterId !== null) {
      alert("Please save or cancel your current semester edits first.");
      return;
    }
    const newId = Date.now();
    const newSem = { id: newId, name: `New Semester`, subjects: [{ id: Date.now() + 1, name: "", grade: "", units: "", tag: "" }] };
    setSemesters([newSem, ...semesters]);
    setExpandedSemesterId(newId);
    setEditingSemesterId(newId);
    setIsCreatingSemesterId(newId);
  };

  const deleteSemester = (e: any, semId: number) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this entire semester?")) {
      const updated = semesters.filter(s => s.id !== semId);
      setSemesters(updated);
      syncToCloud(updated);
      if (expandedSemesterId === semId) setExpandedSemesterId(null);
      if (editingSemesterId === semId) setEditingSemesterId(null);
      if (isCreatingSemesterId === semId) setIsCreatingSemesterId(null);
    }
  };

  const openExportModal = () => {
    setSelectedExportSems(semesters.map(s => s.id));
    setIsExportModalOpen(true);
  };
  const handleExportPDF = () => {
    setIsExportModalOpen(false);
    setTimeout(() => window.print(), 100);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setView('guest');
  };

  const cumulativeNum = parseFloat(analytics.cumulative);
  const numericTarget = parseFloat(targetGwa);
  const isDeansLister = cumulativeNum > 0 && cumulativeNum <= 1.75;

  // Dynamic Theme Classes
  const isDark = themeMode === "Dark";
  const mainBg = isDark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900";
  const cardBg = isDark ? "bg-slate-900 border-slate-800 shadow-none text-slate-100" : "bg-white border-slate-200/60 shadow-sm text-slate-900";
  const inputBg = isDark ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-400 placeholder:text-slate-300";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textSubHeading = isDark ? "text-slate-300" : "text-slate-400";
  const textHeading = isDark ? "text-white" : "text-slate-800";

  return (
    <>
      <main className={`min-h-screen pb-24 font-sans animate-in fade-in duration-500 transition-colors print:hidden ${mainBg}`}>
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
          
          <header className={`flex justify-between items-center border-b pb-6 pt-2 ${isDark ? 'border-slate-800' : 'border-slate-200/60'}`}>
            <div className="flex items-center gap-3">
              <div className="grid grid-cols-2 gap-[2px] p-1.5 bg-indigo-600 rounded-[8px]">
                 <div className="w-2.5 h-2.5 bg-white rounded-[2px]"></div>
                 <div className="w-2.5 h-2.5 border-2 border-white/70 rounded-[2px]"></div>
                 <div className="w-2.5 h-2.5 border-2 border-white/70 rounded-[2px]"></div>
                 <div className="w-2.5 h-2.5 bg-indigo-300 rounded-[2px]"></div>
              </div>
              <h1 className={`text-2xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>BentoGWA</h1>
            </div>
            
            <div className="flex items-center gap-4 relative">
              <button onClick={openExportModal} className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold hover:shadow-sm hover:-translate-y-0.5 transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export PDF
              </button>
              <div className="text-right hidden sm:block">
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName.split(' ')[0]}</p>
                <p className={`text-[10px] font-bold uppercase ${textSubHeading}`}>Student</p>
              </div>
              
              {/* Profile Avatar Trigger */}
              <div 
                className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all hover:scale-105" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {userInitials}
              </div>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className={`absolute top-14 right-0 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className={`p-3 border-b mb-2 sm:hidden ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
                    <p className={`text-xs ${textMuted}`}>Student Account</p>
                  </div>
                  
                  <button onClick={() => { setIsProfileModalOpen(true); setIsProfileMenuOpen(false); }} className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Profile Settings
                  </button>
                  
                  <button onClick={() => setThemeMode(themeMode === "Light" ? "Dark" : "Light")} className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors mb-1 ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    {isDark ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                    Theme: {themeMode}
                  </button>
                  
                  <div className={`border-t pt-1 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button onClick={handleLogout} className={`w-full text-left px-3 py-2.5 text-sm font-bold rounded-xl flex items-center gap-3 transition-colors ${isDark ? 'text-rose-400 hover:bg-rose-900/30' : 'text-rose-600 hover:bg-rose-50'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              
              <div className={`rounded-[24px] p-8 md:p-10 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 border flex justify-between items-center relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-slate-800' : 'bg-gradient-to-br from-indigo-900 to-slate-900 border-slate-800'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-sm font-bold text-indigo-300 uppercase tracking-[0.2em] mb-1">Cumulative GWA</p>
                  <h2 className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums text-white">{cumulativeNum > 0 ? cumulativeNum.toFixed(2) : "0.00"}</h2>
                  <div className="mt-3 inline-flex px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
                    {isDeansLister ? "Dean's Lister Standing 🏆" : "Active Standing"}
                  </div>
                </div>
                <div className="text-right relative z-10 hidden md:block">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned Units</p>
                  <p className="text-4xl font-black text-white tabular-nums">{analytics.totalUnits}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className={`text-lg font-bold ${textHeading}`}>Academic History</h3>
                  <button onClick={addNewSemester} className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 px-4 py-2 rounded-lg transition-all active:scale-95 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Semester
                  </button>
                </div>
                
                {/* ACCORDION LIST */}
                <div className="flex flex-col space-y-3">
                  {isLoadingData ? (
                     <div className={`p-8 text-center rounded-[20px] border ${cardBg}`}>
                        <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <p className={`text-sm ${textMuted}`}>Syncing secure vault...</p>
                     </div>
                  ) : semesters.length === 0 ? (
                     <div className={`p-8 text-center rounded-[20px] border border-dashed ${cardBg}`}>
                        <p className={`text-sm ${textMuted}`}>No semesters added yet. Start tracking your progress!</p>
                     </div>
                  ) : analytics.processedSemesters.map((sem) => (
                    <div key={sem.id} className={`rounded-[20px] transition-all duration-300 border overflow-hidden ${cardBg} ${expandedSemesterId === sem.id ? `ring-2 ${isDark ? 'border-indigo-600 ring-indigo-900' : 'border-indigo-400 ring-indigo-50'}` : `hover:shadow-md hover:-translate-y-0.5`}`}>
                      
                      <div className={`flex justify-between items-center p-4 md:p-5 cursor-pointer group ${expandedSemesterId === sem.id && !isDark ? 'bg-slate-50' : ''} ${expandedSemesterId === sem.id && isDark ? 'bg-slate-800/50' : ''}`} onClick={() => {
                        if (expandedSemesterId === sem.id) {
                           setExpandedSemesterId(null);
                           setEditingSemesterId(null);
                        } else {
                           setExpandedSemesterId(sem.id);
                        }
                      }}>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 w-full">
                          {editingSemesterId === sem.id ? (
                             <input autoFocus type="text" value={sem.name} onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? { ...s, name: e.target.value } : s))} className={`text-sm font-bold border-b outline-none px-1 py-0.5 w-48 ${isDark ? 'bg-slate-900 border-indigo-500 text-white' : 'bg-indigo-50 border-indigo-300 text-slate-900'}`} onClick={(e) => e.stopPropagation()} />
                          ) : (
                            <p className={`text-sm font-bold w-48 truncate group-hover:text-indigo-500 transition-colors ${textHeading}`}>{sem.name}</p>
                          )}
                          <p className={`text-xs font-medium ${textMuted}`}>{sem.subjects.length} Subjects • {sem.units} Units</p>
                        </div>

                        <div className="flex items-center gap-4">
                           <span className={`text-xl font-black tabular-nums ${parseFloat(sem.gwa) <= 1.5 ? 'text-emerald-500' : parseFloat(sem.gwa) <= 2.5 ? 'text-amber-500' : 'text-rose-500'}`}>
                             {parseFloat(sem.gwa).toFixed(2)}
                           </span>
                           <div className={`flex items-center gap-2 border-l pl-3 ml-1 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                             {expandedSemesterId === sem.id && editingSemesterId !== sem.id && (
                               <button onClick={(e) => { 
                                 e.stopPropagation(); 
                                 if (editingSemesterId !== null && editingSemesterId !== sem.id) {
                                    alert("Please save or cancel your current edits first.");
                                    return;
                                 }
                                 setEditingSemesterId(sem.id); 
                               }} className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`} title="Edit Semester">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                               </button>
                             )}
                             <button onClick={(e) => deleteSemester(e, sem.id)} className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`} title="Delete Semester">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                             <div className={`transition-transform duration-300 text-slate-400 ${expandedSemesterId === sem.id ? 'rotate-180' : ''}`}>
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedSemesterId === sem.id && (
                         <div className={`p-4 md:p-5 border-t animate-in fade-in slide-in-from-top-2 duration-200 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            
                            {editingSemesterId === sem.id ? (
                               // EDIT MODE
                               <>
                                <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                                  <div className={`col-span-6 text-[10px] font-bold uppercase tracking-wider ${textSubHeading}`}>Subject</div>
                                  <div className={`col-span-3 text-[10px] font-bold uppercase tracking-wider text-center ${textSubHeading}`}>Grade</div>
                                  <div className={`col-span-2 text-[10px] font-bold uppercase tracking-wider text-center ${textSubHeading}`}>Units</div>
                                </div>
                                <div className="space-y-2">
                                   {sem.subjects.map((sub: any, idx: number) => (
                                     <div key={sub.id} className="grid grid-cols-12 gap-2 items-center group">
                                       <div className="col-span-6"><input type="text" placeholder={`Subj ${idx+1}`} value={sub.name} onChange={(e) => updateEditingSubject(sem.id, sub.id, 'name', e.target.value)} className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors ${inputBg}`} /></div>
                                       <div className="col-span-3"><input type="number" step="0.25" placeholder="0.0" value={sub.grade} onChange={(e) => updateEditingSubject(sem.id, sub.id, 'grade', e.target.value)} className={`w-full text-center rounded-lg px-2 py-2 text-sm font-bold outline-none transition-colors tabular-nums ${inputBg}`} /></div>
                                       <div className="col-span-2"><input type="number" placeholder="0" value={sub.units} onChange={(e) => updateEditingSubject(sem.id, sub.id, 'units', e.target.value)} className={`w-full text-center rounded-lg px-2 py-2 text-sm outline-none transition-colors tabular-nums ${inputBg}`} /></div>
                                       <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => removeEditingSubject(sem.id, sub.id)} className="text-slate-400 hover:text-rose-500 hover:scale-125 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                                     </div>
                                   ))}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-5">
                                   <button onClick={() => addEditingSubject(sem.id)} className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-dashed hover:shadow-sm ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300'}`}>
                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                     Add Subject Row
                                   </button>
                                   
                                   {isCreatingSemesterId === sem.id ? (
                                      <div className="flex gap-2 w-full sm:w-auto">
                                        <button onClick={() => {
                                           setSemesters(semesters.filter(s => s.id !== sem.id));
                                           setIsCreatingSemesterId(null);
                                           setEditingSemesterId(null);
                                        }} className={`w-full sm:w-auto text-xs font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                          Cancel
                                        </button>
                                        <button onClick={() => {
                                           setIsCreatingSemesterId(null);
                                           setEditingSemesterId(null);
                                           syncToCloud(semesters);
                                        }} className="w-full sm:w-auto text-xs font-bold text-white bg-indigo-600 px-6 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">
                                          Save Semester
                                        </button>
                                      </div>
                                   ) : (
                                      <button onClick={() => { setEditingSemesterId(null); syncToCloud(semesters); }} className="w-full sm:w-auto text-xs font-bold text-white bg-slate-900 px-6 py-2.5 rounded-xl hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">Done Editing</button>
                                   )}
                                </div>
                               </>
                            ) : (
                               // READ-ONLY MODE
                               <div className="w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                                  <table className="w-full text-sm text-left">
                                    <thead className={`text-[10px] uppercase tracking-wider ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                      <tr>
                                        <th className="px-4 py-2 font-bold w-1/2">Subject</th>
                                        <th className="px-4 py-2 font-bold text-center w-1/4">Grade</th>
                                        <th className="px-4 py-2 font-bold text-center w-1/4">Units</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {sem.subjects.map((sub: any) => (
                                        <tr key={sub.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                          <td className={`px-4 py-2.5 font-medium ${textHeading}`}>{sub.name || <span className="text-slate-400 italic">Untitled</span>}</td>
                                          <td className={`px-4 py-2.5 font-bold text-center tabular-nums ${textHeading}`}>{sub.grade || "-"}</td>
                                          <td className={`px-4 py-2.5 text-center tabular-nums ${textMuted}`}>{sub.units || "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                               </div>
                            )}
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
              
              <div className={`col-span-2 lg:col-span-1 rounded-[20px] p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 ${cardBg}`}>
                 <p className={`text-xs font-bold uppercase tracking-wider mb-8 ${textSubHeading}`}>Academic Trend</p>
                 
                 <div className="flex h-56 w-full mt-4">
                   {/* Y-Axis Grid (Fixed) */}
                   <div className="flex flex-col justify-between h-full pr-3 pb-[1.4rem] text-[9px] font-bold text-slate-400 text-right shrink-0 z-10">
                     <span>1.00</span>
                     <span>2.00</span>
                     <span>3.00</span>
                     <span>4.00</span>
                     <span>5.00</span>
                   </div>

                   {/* Scrollable Graph Area */}
                   <div className="relative flex-grow overflow-x-auto overflow-y-hidden hide-scrollbar custom-scrollbar pt-8 pb-10">
                     <div className={`relative min-w-full flex items-end justify-start gap-6 pb-0 h-full border-l border-b px-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`} style={{ minWidth: `${Math.max(100, analytics.processedSemesters.length * 20)}%` }}>
                        
                        {/* Static Grid Lines */}
                        {[25, 50, 75].map(pct => (
                          <div key={pct} className={`absolute left-0 right-0 border-t z-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`} style={{ bottom: `${pct}%` }}></div>
                        ))}

                        {/* Target Line (No text) */}
                        {parseFloat(targetGwa) > 0 && !isNaN(parseFloat(targetGwa)) && (
                          <div className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400/60 z-0 pointer-events-none flex justify-end pr-1" style={{ bottom: `${((5.0 - parseFloat(targetGwa)) / 4.0) * 100}%` }}></div>
                        )}

                        {/* Interactive Bars - Sorted oldest first */}
                        {[...analytics.processedSemesters].sort((a,b) => a.id - b.id).map((sem) => {
                           const gwaNum = parseFloat(sem.gwa);
                           const heightPct = gwaNum > 0 ? ((5.0 - gwaNum) / 4.0) * 100 : 0;
                           
                           let barColor = "bg-emerald-400 group-hover:bg-emerald-500 dark:bg-emerald-500/80";
                           let toolTipColor = isDark ? "text-emerald-400" : "text-emerald-600";
                           if (gwaNum > 1.75 && gwaNum <= 3.0) {
                               barColor = "bg-amber-400 group-hover:bg-amber-500 dark:bg-amber-500/80";
                               toolTipColor = isDark ? "text-amber-400" : "text-amber-600";
                           } else if (gwaNum > 3.0) {
                               barColor = "bg-rose-400 group-hover:bg-rose-500 dark:bg-rose-500/80";
                               toolTipColor = isDark ? "text-rose-400" : "text-rose-600";
                           }

                           return (
                              <div key={sem.id} className="w-16 shrink-0 relative h-full flex items-end justify-center group z-10">
                                 <span className={`absolute -top-7 text-[10px] font-bold shadow-sm px-2 py-0.5 rounded border z-10 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all ${toolTipColor} ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                   {gwaNum > 0 ? gwaNum.toFixed(2) : "-"}
                                 </span>
                                 <div className={`w-full rounded-t-sm relative transition-colors ${barColor}`} style={{ height: `${heightPct}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent rounded-t-md pointer-events-none"></div>
                                 </div>
                                 <span className={`absolute -bottom-8 text-[9px] font-bold text-center leading-tight line-clamp-2 w-16 group-hover:text-indigo-500 transition-colors ${textMuted}`}>
                                   {sem.name}
                                 </span>
                              </div>
                           )
                        })}
                     </div>
                   </div>
                 </div>
                 <style dangerouslySetInnerHTML={{__html: `
                    .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                 `}} />
              </div>

              <div className={`col-span-2 lg:col-span-1 rounded-[20px] p-5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-center ${cardBg}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textSubHeading}`}>Global Target GWA</p>
                <div className="flex items-center gap-2">
                  {isEditingTarget ? (
                    <input autoFocus type="number" step="0.05" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} onBlur={saveTarget} onKeyDown={(e) => e.key === 'Enter' && saveTarget()} className={`w-24 font-black text-3xl border-b-2 border-indigo-500 outline-none px-2 py-1 rounded-t-lg tabular-nums animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-slate-900'}`} />
                  ) : (
                    <button onClick={() => setIsEditingTarget(true)} className="flex items-center gap-2 group transition-transform active:scale-95">
                      <span className={`text-3xl font-black tabular-nums group-hover:text-indigo-500 transition-colors ${textHeading}`}>{targetGwa || "--"}</span>
                      <svg className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                {cumulativeNum > 0 && !isNaN(numericTarget) && (
                  <p className={`text-[11px] font-semibold mt-2 px-2 py-1 rounded inline-block border ${cumulativeNum <= numericTarget ? (isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-600 border-amber-100')}`}>
                    {cumulativeNum <= numericTarget 
                      ? `✓ You are ${(numericTarget - cumulativeNum).toFixed(2)} ahead of target!` 
                      : `⚠ You need ${(cumulativeNum - numericTarget).toFixed(2)} to reach target.`}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2 lg:col-span-1">
                 {/* Box 1: Best Subject */}
                 <div className={`rounded-[20px] p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-emerald-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${textSubHeading}`}>Top Subject</p>
                      </div>
                      <p className={`text-lg font-black truncate leading-tight ${textHeading}`}>{analytics.bestSubject?.name || "—"}</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-500 mt-2">{analytics.bestSubject?.grade || "—"}</p>
                 </div>
                 
                 {/* Box 2: Worst Subject */}
                 <div className={`rounded-[20px] p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between ${cardBg}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-rose-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7-7m0 0l-7-7m7 7V3" /></svg></div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${textSubHeading}`}>Needs Focus</p>
                      </div>
                      <p className={`text-lg font-black truncate leading-tight ${textHeading}`}>{analytics.worstSubject?.name || "—"}</p>
                    </div>
                    <p className="text-sm font-bold text-rose-500 mt-2">{analytics.worstSubject?.grade || "—"}</p>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* ========================================
        PROFILE SETTINGS MODAL
        ========================================
      */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className={`rounded-[24px] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-slate-800">
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile Settings</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${inputBg}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Course / Program</label>
                <input type="text" value={profile.course} onChange={(e) => setProfile({...profile, course: e.target.value})} className={`mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${inputBg}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>University</label>
                <input type="text" value={profile.university} onChange={(e) => setProfile({...profile, university: e.target.value})} className={`mt-1 w-full rounded-xl px-4 py-3 text-sm outline-none transition-all ${inputBg}`} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsProfileModalOpen(false)} className={`py-2.5 px-5 text-sm font-bold rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
              <button onClick={() => setIsProfileModalOpen(false)} className="py-2.5 px-5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
        PDF EXPORT MODAL
        ========================================
      */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className={`rounded-[24px] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Export Academic Grades</h3>
            <p className={`text-sm mb-6 ${textMuted}`}>Select the semesters you wish to include in your generated PDF report.</p>
            
            <div className={`flex justify-between items-center mb-3 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Select All</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={selectedExportSems.length === semesters.length}
                onChange={(e) => setSelectedExportSems(e.target.checked ? semesters.map(s => s.id) : [])}
              />
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {semesters.map(sem => (
                <label key={sem.id} className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-colors ${isDark ? 'hover:bg-slate-800 border-transparent hover:border-slate-700' : 'hover:bg-slate-50 border-transparent hover:border-slate-200'}`}>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{sem.name}</p>
                    <p className={`text-[10px] font-medium ${textMuted}`}>GWA: {parseFloat(analytics.processedSemesters.find(s => s.id === sem.id)?.gwa || "0").toFixed(2)}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedExportSems.includes(sem.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedExportSems([...selectedExportSems, sem.id]);
                      else setSelectedExportSems(selectedExportSems.filter(id => id !== sem.id));
                    }}
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsExportModalOpen(false)} className={`w-1/3 py-3 text-sm font-bold rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
              <button 
                onClick={handleExportPDF} 
                disabled={selectedExportSems.length === 0}
                className="w-2/3 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
        PRINT-ONLY LAYOUT (Hidden on screen)
        ========================================
      */}
      <div className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto">
        <div className="border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-black mb-1">Official Grade Report</h1>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-lg font-bold">{profile.name}</p>
              <p className="text-sm">{profile.course} | {profile.university}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">Cumulative GWA: {cumulativeNum > 0 ? cumulativeNum.toFixed(2) : "0.00"}</p>
              <p className="text-sm">Total Earned Units: {analytics.totalUnits}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {analytics.processedSemesters
            .filter(sem => selectedExportSems.includes(sem.id))
            .sort((a,b) => a.id - b.id)
            .map(sem => (
            <div key={sem.id} className="break-inside-avoid">
              <div className="flex justify-between items-center bg-slate-100 p-2 border border-slate-300 font-bold mb-2">
                <h3>{sem.name}</h3>
                <span>Semester GWA: {parseFloat(sem.gwa).toFixed(2)}</span>
              </div>
              <table className="w-full text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 p-2 text-left w-1/2">Subject</th>
                    <th className="border border-slate-300 p-2 text-center w-1/4">Grade</th>
                    <th className="border border-slate-300 p-2 text-center w-1/4">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((sub: any) => (
                    <tr key={sub.id}>
                      <td className="border border-slate-300 p-2">{sub.name || "Untitled"}</td>
                      <td className="border border-slate-300 p-2 text-center">{sub.grade || "-"}</td>
                      <td className="border border-slate-300 p-2 text-center">{sub.units || "-"}</td>
                    </tr>
                  ))}
                  {sem.subjects.length === 0 && (
                    <tr><td colSpan={3} className="border border-slate-300 p-4 text-center italic text-slate-500">No subjects recorded for this semester.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
          {selectedExportSems.length === 0 && (
            <p className="italic text-center mt-10">No semesters selected for export.</p>
          )}
        </div>
      </div>
    </>
  );
}