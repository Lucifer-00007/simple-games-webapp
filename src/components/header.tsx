import { Gamepad2 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Gamepad2 className="w-6 h-6" />
          <span>GameVerse</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
