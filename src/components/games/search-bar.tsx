'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Search games...',
}: SearchBarProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className="relative group w-full max-w-md">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
            <div className="relative flex items-center bg-background rounded-lg border border-border/50 overflow-hidden">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-10 pr-10 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {value && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="absolute right-1 h-8 w-8 hover:bg-transparent"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
