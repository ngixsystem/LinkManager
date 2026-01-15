import { useState } from 'react';
import { ExternalLink, MoreHorizontal, Pencil, Trash2, GripVertical, Globe } from 'lucide-react';
import { Link } from '@/types/link';
import { getFaviconUrl } from '@/utils/favicon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LinkCardProps {
    link: Link;
    onEdit: (link: Link) => void;
    onDelete: (linkId: string) => void;
    index: number;
    dragHandleProps?: Record<string, unknown>;
    isDragging?: boolean;
}

export function LinkCard({ link, onEdit, onDelete, index, dragHandleProps, isDragging }: LinkCardProps) {
    const [imageError, setImageError] = useState(false);
    // Prefer manual favicon, fallback to auto
    const faviconUrl = link.favicon || getFaviconUrl(link.url);

    const handleClick = () => {
        window.open(link.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            className={`group relative flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 cursor-pointer animate-fade-up stagger-${Math.min(index + 1, 6)} ${isDragging ? 'opacity-50' : ''}`}
            style={{ animationFillMode: 'backwards' }}
            onClick={handleClick}
        >
            {/* Drag Handle */}
            <div
                className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing touch-none"
                onClick={(e) => e.stopPropagation()}
                {...dragHandleProps}
            >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Favicon */}
            <div
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-background flex items-center justify-center overflow-hidden shadow-ios-sm"
            >
                {!imageError && faviconUrl ? (
                    <img
                        src={faviconUrl}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                )}
            </div>

            {/* Title (Centered vertically since URL is gone) */}
            <div className="flex-1 min-w-0 flex items-center">
                <h4 className="font-medium text-sm truncate text-foreground">{link.title}</h4>
            </div>

            {/* External Link Icon */}
            <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Actions Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-accent transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-border/50">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(link); }} className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDelete(link.id); }}
                        className="gap-2 text-destructive focus:text-destructive"
                    >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
