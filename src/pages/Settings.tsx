import { useState } from 'react'
import { Bell, Shield, Palette, Globe, Clock, Save, Moon, Sun } from 'lucide-react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    daily: true,
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">系统设置</h1>
        </div>

        {/* 外观设置 */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">外观</h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-slate-200 mb-1">深色模式</div>
              <div className="text-sm text-slate-400">切换界面主题</div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-all ${
                darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'
              }`}
            >
              {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">通知</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 mb-1">邮件通知</div>
                <div className="text-sm text-slate-400">接收重要更新</div>
              </div>
              <button
                onClick={() => setNotifications({...notifications, email: !notifications.email})}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  notifications.email ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                {notifications.email && <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 mb-1">推送通知</div>
                <div className="text-sm text-slate-400">实时提醒</div>
              </div>
              <button
                onClick={() => setNotifications({...notifications, push: !notifications.push})}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  notifications.push ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                {notifications.push && <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-200 mb-1">每日总结</div>
                <div className="text-sm text-slate-400">每天 22:00 推送</div>
              </div>
              <button
                onClick={() => setNotifications({...notifications, daily: !notifications.daily})}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  notifications.daily ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              >
                {notifications.daily && <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* 区域设置 */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">区域和语言</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">时区</label>
              <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/50">
                <option value="Asia/Shanghai">Asia/Shanghai (中国标准时间)</option>
                <option value="America/New_York">America/New_York (东部时间)</option>
                <option value="Europe/London">Europe/London (格林威治时间)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">语言</label>
              <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/50">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* 时区设置 */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">时间设置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">活动记录时间偏移（小时）</label>
              <input
                type="number"
                defaultValue="0"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="text-sm text-slate-400">
              用于记录活动时间与本地时间的偏差调整
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            <Save className="w-5 h-5" />
            <span>保存设置</span>
          </button>
        </div>
      </div>
    </div>
  )
}
