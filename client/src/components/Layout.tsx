import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  PieChart, 
  Wallet, 
  LayoutDashboard, 
  History, 
  Settings, 
  User, 
  Menu, 
  Plus,
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
  onAddAsset?: () => void;
}

export default function Layout({ children, onAddAsset }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: <LayoutDashboard className="mr-3 h-5 w-5" /> 
    },
    { 
      name: "Assets", 
      href: "/assets", 
      icon: <Wallet className="mr-3 h-5 w-5" /> 
    },
    { 
      name: "Tracking", 
      href: "/tracking", 
      icon: <LineChart className="mr-3 h-5 w-5" /> 
    },
    { 
      name: "History", 
      href: "/history", 
      icon: <History className="mr-3 h-5 w-5" /> 
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: <Settings className="mr-3 h-5 w-5" /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white">
        <div className="p-5 border-b border-gray-700 flex items-center">
          <PieChart className="h-6 w-6 text-blue-500 mr-3" />
          <h1 className="text-xl font-bold">Asset Tracker</h1>
        </div>
        <nav className="flex-1 p-5">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.name} className="mb-1">
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors",
                    location === item.href
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-5 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-gray-400">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation (mobile) */}
        <nav className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <PieChart className="h-5 w-5 text-blue-500 mr-2" />
            <h1 className="text-lg font-bold">Asset Tracker</h1>
          </div>
          <button 
            onClick={toggleMobileMenu} 
            className="text-white focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 text-white p-4 border-t border-gray-700">
            <ul>
              {navigationItems.map((item) => (
                <li key={item.name} className="mb-1">
                  <Link 
                    href={item.href}
                    className={cn(
                      "flex items-center p-3 rounded-lg transition-colors",
                      location === item.href
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto bg-gray-100">
          {children}
          <Toaster />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden flex items-center justify-around bg-white border-t border-gray-200 py-3">
          <Link 
            href="/"
            className={cn("flex flex-col items-center", location === "/" ? "text-blue-500" : "text-gray-500")}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link 
            href="/assets"
            className={cn("flex flex-col items-center", location === "/assets" ? "text-blue-500" : "text-gray-500")}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Assets</span>
          </Link>
          <Button 
            onClick={onAddAsset} 
            className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg relative -top-5"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Link 
            href="/history"
            className={cn("flex flex-col items-center", location === "/history" ? "text-blue-500" : "text-gray-500")}
          >
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link 
            href="/settings"
            className={cn("flex flex-col items-center", location === "/settings" ? "text-blue-500" : "text-gray-500")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}