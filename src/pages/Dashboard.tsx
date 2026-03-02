import { useState, useEffect } from 'react'
import { TrendingUp, Activity, Calendar, Target, Zap, Flame, Sparkles, Clock, MapPin } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayEntries: 3,
    weekEntries: 15,
    avgMood: 7.5,
    streak: 7,
    topActivity: '运动',
  })

  return (
    <div className="space-y-6">
      {/* 欢迎 Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              欢迎回来，主人！
            </h1>
            <p className="text-slate-300">
              今天已经记录了 {stats.todayEntries} 条活动，继续保持吧！
            </p>
          </div>
          <div className="hidden md:block w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Flame className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-slate-600" />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{stats.todayEntries}</div>
          <div className="text-sm text-slate-400 mt-1">今日记录</div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-6 h-6 text-slate-600" />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{stats.weekEntries}</div>
          <div className="text-sm text-slate-400 mt-1">本周记录</div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <Flame className="w-6 h-6 text-slate-600" />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{stats.streak}天</div>
          <div className="text-sm text-slate-400 mt-1">连续记录</div>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-slate-600" />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">{stats.avgMood}</div>
          <div className="text-sm text-slate-400 mt-1">平均心情</div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">快速操作</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-slate-300">记录活动</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-slate-300">查看时间线</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-slate-300">数据分析</span>
          </button>

          <button className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm text-slate-300">设置目标</span>
          </button>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all hover:border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">最近活动</h2>
          </div>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">查看全部 →</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-slate-200 mb-1">完成前端项目设计，使用 React + Tailwind CSS 实现</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>工作</span>
                <span>•</span>
                <span>办公室</span>
                <span>•</span>
                <span>2小时前</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-slate-200 mb-1">跑步 5 公里，天气很好</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>运动</span>
                <span>•</span>
                <span>公园</span>
                <span>•</span>
                <span>5小时前</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-slate-200 mb-1">和朋友聚餐，聊了很多有趣的话题</p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>社交</span>
                <span>•</span>
                <span>餐厅</span>
                <span>•</span>
                <span>昨天</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
