
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, FileText, Upload, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  href: string;
};

const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Documents', href: '/dashboard/documents' },
    { icon: Upload, label: 'Upload', href: '/dashboard/upload' },
    { icon: Clock, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col bg-sidebar w-64 border-r border-border">
      <div className="flex h-16 items-center justify-start p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">TermSavant</span>
        </Link>
      </div>
      
      <div className="flex flex-col flex-1 py-4">
        <nav className="flex-1 space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {user?.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
