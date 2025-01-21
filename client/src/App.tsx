import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import { useUser } from "@/hooks/use-user";
import { useWebSocket } from "@/hooks/use-websocket";
import { Loader2, LayoutDashboard, FolderKanban, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/hooks/use-theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

function NavBar() {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="space-x-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel</span>
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost" className="space-x-2">
                <FolderKanban className="h-4 w-4" />
                <span>Proyectos</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden md:flex items-center">
              <User className="h-4 w-4 mr-2" />
              {user?.username}
            </span>
            <Button variant="ghost" onClick={() => logout()} className="space-x-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-2 space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Panel</span>
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost" className="w-full justify-start space-x-2">
                <FolderKanban className="h-4 w-4" />
                <span>Proyectos</span>
              </Button>
            </Link>
            <div className="px-2 py-1 text-sm text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-2" />
              {user?.username}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-screen-xl mx-auto">{children}</main>
    </div>
  );
}

function ProtectedApp() {
  useWebSocket();

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return user ? <ProtectedApp /> : <AuthPage />;
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;