
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Upload, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import DashboardSidebar from './DashboardSidebar';

const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  return (
    <header className="flex h-16 items-center border-b border-border bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>
      
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold">Welcome, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">Manage your term sheets</p>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <form className="relative hidden md:flex">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="bg-background pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        <Link to="/dashboard/upload">
          <Button variant="default" size="sm" className="hidden md:flex">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </Link>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
