import { HouseIcon } from './HouseIcon';

interface NavigationProps {
  currentPage: string;
}

/**
 * Navigation — Brand v3.
 *
 * The v2 bar used a colour emoji (🏠) and a blurred glass backdrop. v3 is flat:
 * solid cream, a single hairline top border, and the v3 line-art shop icon.
 */
export function Navigation({ currentPage }: NavigationProps) {
  const navItems = [
    { id: 'home', label: '首页', href: '/' }
  ];

  return (
    <nav className="sticky bottom-0 z-50 bg-brand-v3-cream border-t border-[#E6DCCB]">
      <div className="max-w-lg mx-auto flex justify-around">
        {navItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center py-3 px-6
                transition-colors duration-200
                ${isActive
                  ? 'text-brand-v3-navy'
                  : 'text-gray-500 hover:text-brand-v3-navy'
                }
              `}
            >
              <span className="mb-1 flex h-6 w-6 items-center justify-center">
                <HouseIcon className="w-6 h-6" />
              </span>
              <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-brand-v3-navy' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-brand-v3-gold mt-1" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
