'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarPlus, Users, LogOut, Menu, X, List } from 'lucide-react'
import { useState } from 'react'
import { logout } from './actions'

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/funil', label: 'Visitas (Funil)', icon: List },
    { href: '/novo', label: 'Nova Visita', icon: CalendarPlus },
    ...(isAdmin ? [{ href: '/usuarios', label: 'Gestão de Equipe', icon: Users }] : [])
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-dark-200 border border-dark-100 rounded-md text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-200 border-r border-dark-100 z-40 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <Link href="/" className="flex flex-col gap-1" onClick={() => setIsOpen(false)}>
            <span className="text-primary font-bold text-xl tracking-wider">Equipe Rangel Jr.</span>
            <span className="text-gray-400 font-light text-sm uppercase tracking-[0.2em]">Agendadas</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-500'} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-dark-100">
          <form action={logout}>
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-colors font-medium text-sm border border-transparent">
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
