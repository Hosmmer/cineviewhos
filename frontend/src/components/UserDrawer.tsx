import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { User, Film, Tag, Key, LogOut, ShoppingCart, BarChart3, ChevronDown, X } from 'lucide-react'

interface UserDrawerProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuGroup {
  id: string
  label: string
  icon: React.ReactNode
  items: MenuItem[]
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  action?: 'link' | 'logout'
  to?: string
  disabled?: boolean
  disabledLabel?: string
}

function getAvatarFromStorage(): string | null {
  try {
    const raw = localStorage.getItem('auth_user')
    if (raw) {
      return JSON.parse(raw).avatar || null
    }
  } catch { /* ignore */ }
  return null
}

function UserDrawer({ isOpen, onClose }: UserDrawerProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || ''

  const avatarUrl = user?.avatar || getAvatarFromStorage() || null

  const toggleGroup = (id: string) => {
    setExpandedGroup((prev) => (prev === id ? null : id))
  }

  const handleNavigate = (to: string) => {
    navigate(to)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return
    if (item.action === 'logout') {
      handleLogout()
    } else if (item.to) {
      handleNavigate(item.to)
    }
  }

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector<HTMLElement>('[data-focusable]')
        firstFocusable?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    []
  )

  const menuGroups: MenuGroup[] = [
    {
      id: 'account',
      label: 'Mi Cuenta',
      icon: <User className="w-5 h-5" />,
      items: [
        { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" />, action: 'link', to: '/profile' },
        { id: 'password', label: 'Cambiar Contrasena', icon: <Key className="w-4 h-4" />, action: 'link', to: '/change-password' },
        { id: 'logout', label: 'Cerrar Sesion', icon: <LogOut className="w-4 h-4" />, action: 'logout' },
      ],
    },
    {
      id: 'catalog',
      label: 'Catalogo',
      icon: <Film className="w-5 h-5" />,
      items: [
        { id: 'movies', label: 'Mis Peliculas', icon: <Film className="w-4 h-4" />, action: 'link', to: '/admin/movies' },
        { id: 'genres', label: 'Generos', icon: <Tag className="w-4 h-4" />, action: 'link', to: '/admin/genres' },
      ],
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: <ShoppingCart className="w-5 h-5" />,
      items: [
        { id: 'orders', label: 'Pedidos', icon: <ShoppingCart className="w-4 h-4" />, disabled: true, disabledLabel: 'Proximamente' },
        { id: 'reports', label: 'Reportes', icon: <BarChart3 className="w-4 h-4" />, disabled: true, disabledLabel: 'Proximamente' },
      ],
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="User menu"
        onKeyDown={handleKeyDown}
        className="fixed top-0 right-0 h-full w-[85vw] sm:w-[360px] bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col transform translate-x-0 transition-transform duration-300 ease-out"
      >
        <button
          data-focusable
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pt-8 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-gray-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">{displayName}</p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroup === group.id
            return (
              <div key={group.id}>
                <button
                  data-focusable
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  {group.icon}
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="ml-9 mt-0.5 mb-1 space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        data-focusable
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                          item.disabled
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.disabled && (
                          <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{item.disabledLabel}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default UserDrawer
