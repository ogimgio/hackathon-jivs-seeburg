import { Database, History, Home, Settings, User, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Database", url: "/database", icon: Database },
  { title: "Historical Records", url: "/historical-records", icon: History },
  { title: "Login History", url: "/login-history", icon: Users },
];

const userItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-dashboard-emerald text-white font-medium hover:bg-dashboard-emerald/90 shadow-soft"
      : "hover:bg-muted/50 text-foreground hover:text-dashboard-emerald transition-all duration-300";

  return (
    <Sidebar
      className="border-r border-border bg-card shadow-soft h-screen flex-shrink-0 w-64 data-[state=collapsed]:w-14"
      collapsible="icon"
    >
      <SidebarContent className="bg-card h-full flex flex-col">
        {/* Logo/Brand Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-xs">Jivs</span>
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="font-semibold text-dashboard-navy">Data Portal</h2>
                <p className="text-xs text-dashboard-silver">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-2 py-4 flex-1">
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-muted-foreground font-medium mb-2"}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <SidebarGroup className="px-2 py-4 mt-auto flex-shrink-0">
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : "text-muted-foreground font-medium mb-2"}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapse trigger at bottom */}
        <div className="p-2 border-t border-border flex-shrink-0">
          <SidebarTrigger className="w-full h-10 hover:bg-muted/50 rounded-lg transition-colors" />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}