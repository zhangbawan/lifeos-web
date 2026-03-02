import { useState, useEffect } from 'react'
import {
  Plus, List, Calendar, BarChart3, User, Brain, Loader2, Trash2,
  Edit, Download, Search, Filter, CheckSquare, X, ChevronDown,
  Sparkles, Target, Clock, Award, TrendingUp, FileText, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

type Personality = {
  id: string
  decision_style: string | null
  work_pattern: string | null
  energy_rhythm: string | null
  stress_response: string | null
  social_style: string | null
  task_completion: string | null
  planning_style: string | null
  communication: string | null
  ai_summary: string | null
  strengths: string[] | null
  growth_areas: string[] | null
  confidence_score: number
  analysis_count: number
  last_analyzed: string | null
  change_history: any[] | null
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [currentView, setCurrentView] = useState<'list' | 'timeline' | 'analysis' | 'profile' | 'personality' | 'insights'>('timeline')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    activity: '',
    moodMin: '',
    moodMax: '',
    search: '',
  })

  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month')
  const [insightPeriod, setInsightPeriod] = useState<'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    if (token) {
      loadData()
      loadPersonality()
    }
  }, [token])

  const loadData = async () => {
    setLoading(true)
    try {
      const [entriesRes, statsRes] = await Promise.all([
        fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/entries', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/analysis/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      const entriesData = await entriesRes.json()
      const statsData = await statsRes.json()
      setEntries(entriesData.entries || [])
      setStats(statsData.statistics || null)
    } catch (error) {
      console.error('Load failed:', error)
    }
    setLoading(false)
  }

  const loadPersonality = async () => {
    try {
      const res = await fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/personality', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setPersonality(data.personality)
    } catch (error) {
      console.error('Load personality failed:', error)
    }
  }

  const loadInsights = async () => {
    try {
      const res = await fetch(`https://marvel-remained-pst-specify.trycloudflare.com/api/insights/${insightPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setInsights(data.insights)
    } catch (error) {
      console.error('Load insights failed:', error)
    }
  }

  const handleAnalyzePersonality = async () => {
    const res = await fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/personality/analyze', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      setPersonality(data.personality)
      alert('性格分析完成！')
    }
  }

  const handleLogin = async () => {
    const res = await fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'test123' })
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
    }
  }

  const handleCreate = async (content: string) => {
    await fetch('https://marvel-remained-pst-specify.trycloudflare.com/api/entries', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    setShowCreate(false)
    loadData()
  }

  const handleDelete = async (entryId: number) => {
    if (!confirm('确定要删除这条记录吗？')) return
    await fetch(`https://marvel-remained-pst-specify.trycloudflare.com/api/entries/${entryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    loadData()
  }

  const handleAnalyzeAsync = async (entryId: number) => {
    setAnalyzingId(entryId)
    try {
      await fetch(`https://marvel-remained-pst-specify.trycloudflare.com/api/analyze/${entryId}/async`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const pollInterval = setInterval(async () => {
        const res = await fetch(`https://marvel-remained-pst-specify.trycloudflare.com/api/analyze/${entryId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.status === 'completed') {
          clearInterval(pollInterval)
          setAnalyzingId(null)
          loadData()
          alert('分析完成！')
        }
      }, 2000)
      setTimeout(() => clearInterval(pollInterval), 60000)
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalyzingId(null)
      alert('分析失败，请重试')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <Brain className="w-16 h-16 text-purple-400 mb-4" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">LifeOS Enhanced v2</h1>
            <p className="text-slate-400 mt-1">AI 驱动的人生记录系统</p>
          </div>
          <button onClick={handleLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium">
            登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">LifeOS Enhanced v2</h1>
            </div>
            <nav className="flex items-center gap-2">
              {[
                { id: 'list', label: '记录', icon: List },
                { id: 'timeline', label: '时间线', icon: Calendar },
                { id: 'analysis', label: '统计', icon: BarChart3 },
                { id: 'insights', label: '洞察', icon: Sparkles },
                { id: 'personality', label: '性格', icon: Target },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    currentView === tab.id ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </nav>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-sm font-medium">
              <Plus className="w-5 h-5" /> 记录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin h-16 w-16 text-indigo-500" /></div>
        ) : currentView === 'list' ? (
          <ListView entries={entries} onSelect={setSelectedEntry} onDelete={handleDelete} />
        ) : currentView === 'timeline' ? (
          <TimelineView entries={entries} onSelect={setSelectedEntry} />
        ) : currentView === 'analysis' ? (
          <AnalysisView stats={stats} />
        ) : currentView === 'insights' ? (
          <InsightsView insights={insights} onLoad={loadInsights} />
        ) : currentView === 'personality' ? (
          <PersonalityView personality={personality} onAnalyze={handleAnalyzePersonality} />
        ) : (
          <ProfileView onLogout={() => { localStorage.removeItem('token'); setToken(null); }} />
        )}
      </main>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onAnalyze={handleAnalyzeAsync}
          analyzing={analyzingId === selectedEntry.id}
        />
      )}
    </div>
  )
}

// ==================== Components ====================

function ListView({ entries, onSelect, onDelete }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">记录列表</h2>
        <p className="text-slate-400">{entries.length} 条记录</p>
      </div>
      {entries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <FileText className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <p className="text-slate-400">暂无记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry: any) => (
            <div key={entry.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div onClick={() => onSelect(entry)} className="flex-1 cursor-pointer">
                  <p className="text-slate-200 mb-3">{entry.content}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(entry.recorded_at).toLocaleString('zh-CN')}</span>
                    {entry.summary && <span className="text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">AI 已分析</span>}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimelineView({ entries, onSelect }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">时间线</h2>
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />
        {entries.map((entry: any) => (
          <div key={entry.id} className="relative flex gap-6 mb-6 pl-16">
            <div className="absolute left-4 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold z-10">
              {new Date(entry.recorded_at).getDate()}
            </div>
            <div onClick={() => onSelect(entry)} className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400">{new Date(entry.recorded_at).toLocaleString('zh-CN')}</span>
                {entry.summary && <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">AI 已分析</span>}
              </div>
              <p className="text-slate-200 mb-2">{entry.content}</p>
              {entry.summary && <p className="text-sm text-purple-300 bg-purple-500/10 p-2 rounded">{entry.summary}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisView({ stats }: any) {
  if (!stats || stats.totalEntries === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">数据分析</h2>
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <BarChart3 className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <p className="text-slate-400">暂无统计数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">数据分析</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-400 text-sm">总记录数</p>
          <p className="text-3xl font-bold text-white">{stats.totalEntries || 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-400 text-sm">平均心情</p>
          <p className="text-3xl font-bold text-white">{stats.avgMood || 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">心情趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.moodTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">活动分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.activityDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {(stats.activityDistribution || []).map((entry: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function InsightsView({ insights, onLoad }: any) {
  useEffect(() => { onLoad() }, [])

  if (!insights) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">智能洞察</h2>
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <Sparkles className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <p className="text-slate-400">正在生成洞察...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">智能洞察</h2>
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> 总结
        </h3>
        <p className="text-slate-200">{insights.summary}</p>
      </div>
      {insights.suggestions && insights.suggestions.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" /> 建议
          </h3>
          <ul className="space-y-2">
            {insights.suggestions.map((s: string, i: number) => <li key={i} className="text-slate-200">• {s}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function PersonalityView({ personality, onAnalyze }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">性格分析</h2>
        <button onClick={onAnalyze} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-sm">
          <RefreshCw className="w-5 h-5" /> 分析性格
        </button>
      </div>

      {personality ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">分析次数</p>
              <p className="text-3xl font-bold text-white">{personality.analysis_count}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">置信度</p>
              <p className="text-3xl font-bold text-white">{(personality.confidence_score * 100).toFixed(0)}%</p>
            </div>
          </div>

          {personality.ai_summary && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> AI 总结
              </h3>
              <p className="text-slate-200">{personality.ai_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personality.decision_style && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">决策风格</p>
                <p className="text-lg font-semibold text-white">{personality.decision_style}</p>
              </div>
            )}
            {personality.work_pattern && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">工作模式</p>
                <p className="text-lg font-semibold text-white">{personality.work_pattern}</p>
              </div>
            )}
            {personality.energy_rhythm && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">能量节奏</p>
                <p className="text-lg font-semibold text-white">{personality.energy_rhythm}</p>
              </div>
            )}
            {personality.stress_response && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">压力反应</p>
                <p className="text-lg font-semibold text-white">{personality.stress_response}</p>
              </div>
            )}
            {personality.task_completion && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">任务完成</p>
                <p className="text-lg font-semibold text-white">{personality.task_completion}</p>
              </div>
            )}
            {personality.planning_style && (
              <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm mb-1">规划风格</p>
                <p className="text-lg font-semibold text-white">{personality.planning_style}</p>
              </div>
            )}
          </div>

          {personality.strengths && personality.strengths.length > 0 && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> 你的优势
              </h3>
              <ul className="space-y-2">
                {personality.strengths.map((s: string, i: number) => <li key={i} className="text-slate-200">• {s}</li>)}
              </ul>
            </div>
          )}

          {personality.growth_areas && personality.growth_areas.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> 成长空间
              </h3>
              <ul className="space-y-2">
                {personality.growth_areas.map((g: string, i: number) => <li key={i} className="text-slate-200">• {g}</li>)}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <Brain className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">还没有性格分析数据</p>
          <p className="text-sm text-slate-500 mb-6">记录至少 5 条生活片段后，点击"分析性格"开始</p>
          <button onClick={onAnalyze} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
            开始分析
          </button>
        </div>
      )}
    </div>
  )
}

function ProfileView({ onLogout }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">个人设置</h2>
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-slate-300 mb-4">test@example.com</p>
        <button onClick={onLogout} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg">退出登录</button>
      </div>
    </div>
  )
}

function CreateModal({ onClose, onSubmit }: any) {
  const [content, setContent] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/10">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl text-white">记录</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="输入你的记录内容..."
          className="w-full h-40 p-4 rounded-xl bg-white/5 border border-white/10 text-white resize-none focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => content.trim() && onSubmit(content)}
          disabled={!content.trim()}
          className="w-full mt-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white disabled:opacity-50"
        >
          保存
        </button>
      </div>
    </div>
  )
}

function EntryDetail({ entry, onClose, onAnalyze, analyzing }: any) {
  if (!entry) return null
  const tags = Array.isArray(entry?.tags) ? entry.tags : []
  const suggestions = Array.isArray(entry?.suggestions) ? entry.suggestions : []
  const warnings = Array.isArray(entry?.warnings) ? entry.warnings : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-slate-900 border border-white/10">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl text-white">详情</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <p className="text-slate-200 mb-4">{entry.content}</p>
        {entry.summary && (
          <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-400 mb-1">AI 简介</p>
            <p className="text-slate-200">{entry.summary}</p>
          </div>
        )}
        {entry.comment && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-indigo-400">AI 点评</p>
            </div>
            <p className="text-slate-200 text-sm">{entry.comment}</p>
          </div>
        )}
        {tags.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">AI 标签</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, i: number) => <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm">{tag}</span>)}
            </div>
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-emerald-400">AI 建议</p>
            </div>
            <ul className="space-y-1">
              {suggestions.map((s: string, i: number) => <li key={i} className="text-slate-200 text-sm">• {s}</li>)}
            </ul>
          </div>
        )}
        <button
          onClick={() => onAnalyze(entry.id)}
          disabled={analyzing || !!entry.summary}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> 分析中...</> : entry.summary ? '已分析' : <><Brain className="w-5 h-5" /> AI 分析</>}
        </button>
      </div>
    </div>
  )
}

export default App
