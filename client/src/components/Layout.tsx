import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  BookOpen, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckSquare,
  Home,
  ChevronDown,
  ChevronUp,
  Package,
  Building2
} from 'lucide-react'

const SIDEBAR_PREFERENCE_KEY = 'eldercare_sidebar_expanded'

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(true) // Start expanded to show submenu
  
  // Sidebar state management - auto-collapse on non-dashboard screens
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const savedPreference = localStorage.getItem(SIDEBAR_PREFERENCE_KEY)
    if (savedPreference !== null) {
      return JSON.parse(savedPreference)
    }
    // Default: expanded only on dashboard/clients, collapsed elsewhere
    return location.pathname === '/' || location.pathname === '/clients'
  })

  // Auto-collapse sidebar when navigating away from dashboard
  useEffect(() => {
    const isDashboard = location.pathname === '/' || location.pathname === '/clients'
    if (!isDashboard && sidebarExpanded) {
      const savedPreference = localStorage.getItem(SIDEBAR_PREFERENCE_KEY)
      if (savedPreference === null) {
        // Only auto-collapse if user hasn't manually set preference
        setSidebarExpanded(false)
      }
    }
  }, [location.pathname, sidebarExpanded])

  // Save sidebar preference to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_PREFERENCE_KEY, JSON.stringify(sidebarExpanded))
  }, [sidebarExpanded])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Assessments', href: '/assessments', icon: ClipboardList },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Task Tracker', href: '/tasks', icon: CheckSquare },
    { 
      name: 'Resources', 
      href: '/resources', 
      icon: BookOpen,
      hasSubmenu: true,
      submenu: [
        { name: 'Resource Directory', href: '/resources', icon: Building2 },
        { name: 'ECC Preferred Products', href: '/resources?view=preferred-products', icon: Package }
      ]
    },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  if (profile?.role === 'admin') {
    navigation.splice(-1, 0, { name: 'Admin', href: '/admin', icon: Settings })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' && location.pathname === '/') {
      return true
    }
    if (href === '/clients' && location.pathname === '/clients') {
      return true
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <div className="flex items-center">
                <img src="/ECCcolorchart_edited.webp" alt="ECC Logo" className="h-8 w-auto" />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                if (item.hasSubmenu) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => {
                          console.log('Mobile Resources clicked, current state:', resourcesExpanded);
                          setResourcesExpanded(!resourcesExpanded);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-blue-100 text-blue-700 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          {item.name}
                        </div>
                        {resourcesExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {resourcesExpanded && (
                        <div className="mt-2 ml-6 space-y-1">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === subItem.href || 
                                (subItem.href.includes('preferred-products') && location.search.includes('preferred-products'))
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                            >
                              <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.role === 'admin' ? 'Administrator' : 'Care Manager'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'lg:w-64' : 'lg:w-16'
      }`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          {/* Header - Logo only */}
          <div className="flex h-16 items-center justify-center px-4 border-b">
            <img 
              src="/ECCcolorchart_edited.webp" 
              alt="ECC Logo" 
              className={`h-8 w-auto transition-all duration-300 ${
                sidebarExpanded ? 'mr-auto' : 'mx-auto'
              }`}
              style={{ aspectRatio: 'auto' }}
            />
          </div>

          {/* Toggle button */}
          <div className="px-2 py-2 border-b">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarExpanded ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              if (item.hasSubmenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => {
                        console.log('Resources clicked, current state:', resourcesExpanded);
                        setResourcesExpanded(!resourcesExpanded);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                        active
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={!sidebarExpanded ? item.name : undefined}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarExpanded && (
                          <span className="ml-3 whitespace-nowrap">{item.name}</span>
                        )}
                      </div>
                      {sidebarExpanded && (
                        resourcesExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                      {!sidebarExpanded && (
                        <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </button>
                    {resourcesExpanded && sidebarExpanded && (
                      <div className="mt-1 ml-8 space-y-1">
                        {item.submenu?.map((subItem) => {
                          console.log('Rendering submenu item:', subItem.name, subItem.href);
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                location.pathname === subItem.href || 
                                (subItem.href.includes('preferred-products') && location.search.includes('preferred-products'))
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                            >
                              <subItem.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                              <span>{subItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                    active
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={!sidebarExpanded ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarExpanded && (
                    <span className="ml-3 whitespace-nowrap">{item.name}</span>
                  )}
                  {!sidebarExpanded && (
                    <div className="absolute left-16 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-2 border-t">
            <div className={`flex items-center transition-all duration-300 ${
              sidebarExpanded ? 'px-3 py-2' : 'justify-center py-2'
            }`}>
              {sidebarExpanded ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500">{profile?.role === 'admin' ? 'Administrator' : 'Care Manager'}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <div className="relative group">
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                  <div className="absolute left-12 bottom-0 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Sign out
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
      }`}>
        {/* Mobile header */}
        <div className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <img src="/ECCcolorchart_edited.webp" alt="ECC Logo" className="h-8 w-auto" />
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop hamburger toggle */}
        <div className="hidden lg:block">
          <div className="h-16 bg-white border-b shadow-sm">
            <div className="flex items-center h-full px-4">
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}