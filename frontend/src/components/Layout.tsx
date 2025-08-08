import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <AppSidebar />
                <main className="flex-1 overflow-auto bg-slate-50 flex items-start justify-center">
                    <div className="w-full max-w-4xl p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}