import { useState, useEffect } from 'react'
import { User, Settings, Calendar, MapPin, Activity, LogOut, Edit2, Save, X } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  timezone: string
  created_at: string
  updated_at: string
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    // 模拟用户数据
    setUser({
      id: 'cmlr1uhxp00003mpm22i124qv',
      email: 'test@example.com',
      name: 'Test User',
      timezone: 'Asia/Shanghai',
      created_at: '2026-02-17T20:22:08.462Z',
      updated_at: '2026-02-17T20:22:08.462Z'
    })
    setName('Test User')
  }, [])

  const handleSave = () => {
    setEditing(false)
    // 保存逻辑
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-slate-400">加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 整体页面卡片 + 渐变标题 */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">个人设置</h1>
        </div>

        {/* 用户信息卡片 */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-bold text-white bg-transparent border-b-2 border-purple-500 focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <button onClick={handleSave} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <Save className="w-5 h-5 text-emerald-400" />
                    </button>
                  ) : (
                    <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <Edit2 className="w-5 h-5 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{user.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 详细信息卡片 */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">详细信息</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-slate-400">邮箱</span>
            <span className="text-slate-200">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-slate-400">用户ID</span>
            <code className="text-slate-300 bg-white/5 px-2 py-1 rounded text-sm">{user.id}</code>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-slate-400">加入时间</span>
            <span className="text-slate-200">{new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-400">最后更新</span>
            <span className="text-slate-200">{new Date(user.updated_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 账户设置卡片 */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">账户操作</h3>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  )
}
