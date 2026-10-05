"use client"

import { useRouter } from "next/navigation"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  type LoginResponse,
  type RegisterResponse,
  type UserInfo,
} from "@/services/auth-service"

export interface User {
  id: number | string
  username: string
  name: string
  phone: string
  phoneNumber: string
  email?: string
  avatar?: string
  level: string
  star_coins: number
  starValue: number
  tongbao: number
  is_local_user: boolean
  isLocalUser: boolean
  user_type: "normal" | "creator" | "vip"
  userType: "normal" | "creator" | "vip"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (phone: string, code: string) => Promise<LoginResponse>
  register: (
    username: string,
    phone: string,
    code: string,
    details?: { email?: string; password?: string },
  ) => Promise<RegisterResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 服务层 UserInfo → 上下文 User 归一化。
 * 无有效用户时严格返回 null（修复了空对象被误判为已登录的问题）。
 */
function normalizeUser(raw: UserInfo | null | undefined): User | null {
  if (!raw || !raw.username) {
    return null
  }
  const levelMap: Record<UserInfo["userType"], string> = {
    vip: "VIP 会员",
    creator: "认证创作者",
    normal: "普通用户",
  }
  return {
    id: raw.id,
    username: raw.username,
    name: raw.username,
    phone: raw.phoneNumber,
    phoneNumber: raw.phoneNumber,
    email: raw.email,
    avatar: raw.avatar,
    level: levelMap[raw.userType],
    starValue: 0,
    star_coins: 0,
    tongbao: 0,
    isLocalUser: raw.isLocalUser,
    is_local_user: raw.isLocalUser,
    user_type: raw.userType,
    userType: raw.userType,
  }
}

/** 会话持久化：静态演示模式下用户与令牌仅保存在本机浏览器 */
function persistSession(response: LoginResponse): void {
  try {
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user))
    }
    if (response.token) {
      localStorage.setItem("token", response.token)
    }
  } catch (error) {
    console.error("会话持久化失败:", error)
  }
}

function deviceInfo() {
  if (typeof navigator === "undefined") {
    return undefined
  }
  return { userAgent: navigator.userAgent, platform: navigator.platform }
}

/** 从本地会话加载并归一化当前用户（纯函数，不触碰 setState） */
async function loadCurrentUser(): Promise<User | null> {
  try {
    return normalizeUser(await getUserInfo(""))
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return null
  }
}

/**
 * 认证上下文（静态演示模式单源实现）。
 *
 * 2026-10-05 整改（P0-3）：
 * - 移除对 /api/auth/* 的 fetch 双栈调用——静态导出下这些端点不存在，
 *   旧实现会导致"mock 成功 + 真实接口 404 → 必然报登录失败"
 * - 唯一数据源：services/auth-service（本机模拟），后续全栈轨恢复时在此单点切换
 * - login/register 返回服务响应供页面组装提示；导航由页面自行控制
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const login = useCallback(async (phone: string, code: string) => {
    const response = await loginUser({
      phoneNumber: phone,
      verificationCode: code,
      deviceInfo: deviceInfo(),
    })

    if (!response.success) {
      throw new Error(response.message || "登录失败")
    }

    persistSession(response)
    setUser(normalizeUser(response.user))
    return response
  }, [])

  const register = useCallback(
    async (
      username: string,
      phone: string,
      code: string,
      details?: { email?: string; password?: string },
    ) => {
      const response = await registerUser({
        username,
        phoneNumber: phone,
        verificationCode: code,
        email: details?.email || `${phone}@demo.local`,
        password: details?.password || `demo-${Date.now()}`,
        deviceInfo: deviceInfo(),
      })

      if (!response.success) {
        throw new Error(response.message || "注册失败")
      }
      return response
    },
    [],
  )

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
    router.push("/auth")
  }, [router])

  const refreshUser = useCallback(async () => {
    setUser(await loadCurrentUser())
    setLoading(false)
  }, [setUser, setLoading])

  // 挂载时从本地会话恢复用户；setUser/setLoading 均在 await 之后异步执行，
  // 用 cancelled 守卫避免卸载后写入
  useEffect(() => {
    let cancelled = false
    void loadCurrentUser().then((next) => {
      if (cancelled) {
        return
      }
      setUser(next)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
