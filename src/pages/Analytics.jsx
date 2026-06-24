import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function Analytics() {
  const { xp } = useApp();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const xpData = [
    { day: 'Mon', xp: Math.max(0, xp - 600) },
    { day: 'Tue', xp: Math.max(0, xp - 500) },
    { day: 'Wed', xp: Math.max(0, xp - 450) },
    { day: 'Thu', xp: Math.max(0, xp - 300) },
    { day: 'Fri', xp: Math.max(0, xp - 200) },
    { day: 'Sat', xp: Math.max(0, xp - 100) },
    { day: 'Sun', xp: xp },
  ];

  const skillData = [
    { subject: 'Reading', A: 85, fullMark: 100 },
    { subject: 'Pronunciation', A: 65, fullMark: 100 },
    { subject: 'Comprehension', A: 90, fullMark: 100 },
    { subject: 'Fluency', A: 70, fullMark: 100 },
    { subject: 'Vocabulary', A: 80, fullMark: 100 },
    { subject: 'Grammar', A: 75, fullMark: 100 },
  ];

  return (
    <div className={`page ${mounted ? 'active' : ''}`} id="page-analytics">
      <div className="section-header mb-6">
        <h3 className="section-title">Deep AI Analytics</h3>
        <p className="section-subtitle">Detailed insights into your learning patterns and skill growth.</p>
      </div>

      <div className="analytics-grid">
        <div className="card chart-card animate-in">
          <h3 className="card-title">XP Progression</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={xpData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="var(--text2)" />
                <YAxis stroke="var(--text2)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--primary)' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  activeDot={{ r: 8, fill: 'var(--accent)' }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card animate-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="card-title">Skill Radar</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text2)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Skill Level" 
                  dataKey="A" 
                  stroke="var(--primary)" 
                  fill="var(--primary)" 
                  fillOpacity={0.4} 
                  animationDuration={1500}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card mt-6 ai-report-card animate-in" style={{ animationDelay: '0.2s' }}>
        <div className="report-header">
          <div className="report-icon">🤖</div>
          <div>
            <h3 className="card-title mb-0">AI Coach Weekly Report</h3>
            <p className="text-sm text-gray">Generated based on your last 7 days of practice.</p>
          </div>
        </div>
        
        <div className="report-body mt-4">
          <div className="report-section positive">
            <h4><span className="icon">📈</span> Strengths</h4>
            <p>Your <strong>Reading Comprehension</strong> is in the top 10% of learners at your level. You consistently score above 90% on detailed extraction tasks.</p>
          </div>
          
          <div className="report-section focus">
            <h4><span className="icon">🎯</span> Focus Areas</h4>
            <p>Your <strong>Pronunciation</strong> and <strong>Fluency</strong> dipped slightly during the interactive dialogue sessions. We noticed hesitation around complex consonant clusters.</p>
          </div>
          
          <div className="report-section action">
            <h4><span className="icon">🚀</span> Recommended Action</h4>
            <p>I've added a custom <em>"Tongue Twister & Shadowing"</em> module to your Practice tab. Spend 10 minutes there before your next major lesson.</p>
          </div>
        </div>
        
        <button className="btn-primary mt-6 w-full" onClick={() => window.alert('Jumping to custom practice module...')}>
          Start Recommended Practice
        </button>
      </div>
    </div>
  );
}
