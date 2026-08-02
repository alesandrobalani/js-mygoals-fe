import { Link, Outlet } from 'react-router-dom';

interface NavLink {
  to: string;
  label: string;
}

interface LayoutViewProps {
  userName: string | undefined;
  navLinks: NavLink[];
  activePath: string;
  onLogout: () => void;
}

export function LayoutView({ userName, navLinks, activePath, onLogout }: LayoutViewProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-sky-600 font-bold text-lg tracking-tight">MyGoals</span>
            <nav className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePath.startsWith(link.to)
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{userName}</span>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
