import { useState } from 'react'
import { Activity, LogIn } from 'lucide-react'

interface LoginProps {
  onLogin: (token: string) => void
  darkMode: boolean
}

export default function Login({ onLogin, darkMode }: LoginProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)
    try {
      // 保存 token
      localStorage.setItem('token', token)
      onLogin(token)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={cn(
        'w-full max-w-md rounded-2xl p-8',
        darkMode ? 'bg-gray-800' : 'bg-white'
      )}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className={cn('text-2xl font-bold', darkMode ? 'text-white' : 'text-gray-900')}>
            LifeOS
          </h1>
          <p className={cn('text-sm mt-1', darkMode ? 'text-gray-400' : 'text-gray-500')}>
            人生操作系统
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={cn('block text-sm font-medium mb-2', darkMode ? 'text-gray-300' : 'text-gray-700')}>
              访问令牌
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="输入你的访问令牌"
              className={cn(
                'w-full px-4 py-3 rounded-lg border placeholder-gray-400',
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              )}
            />
          </div>

          <button
            type="submit"
            disabled={!token.trim() || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                登录
              </>
            )}
          </button>
        </form>

        <div className={cn('mt-6 text-sm text-center', darkMode ? 'text-gray-400' : 'text-gray-500')}>
          <p>测试环境：使用 mock_token_123</p>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
