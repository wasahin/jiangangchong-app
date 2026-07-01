interface NavigationProps {
  currentPage: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const navItems = [
    { id: 'home', label: '首页', href: '/' },
    { id: 'staff', label: '员工', href: '/staff' }
  ];
  
  return (
    <nav className="sticky bottom-0 z-50 bg-neumo-light/90 backdrop-blur-xl border-t border-white/40">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center py-3 px-6
                transition-all duration-200
                ${isActive 
                  ? 'text-accent-amber' 
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <span className="text-2xl mb-1">
                {item.id === 'home' ? '🏠' : '👨‍💼'}
              </span>
              <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-accent-amber' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-accent-amber mt-1" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
