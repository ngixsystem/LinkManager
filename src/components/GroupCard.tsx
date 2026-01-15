import { useState } from 'react';
import { ChevronDown, Plus, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { LinkGroup, Link } from '@/types/link';
import { GroupIcon } from './icons/GroupIcon';
import { DraggableLinkCard } from './DraggableLinkCard';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface GroupCardProps {
    group: LinkGroup;
    onToggle: () => void;
    onEdit: (group: LinkGroup) => void;
    onDelete: (groupId: string) => void;
    onAddLink: (groupId: string) => void;
    onEditLink: (groupId: string, link: Link) => void;
    onDeleteLink: (groupId: string, linkId: string) => void;
    index: number;
    size?: 'compact' | 'normal' | 'large';
    dragHandleProps?: Record<string, unknown>;
    isDragging?: boolean;
}

const sizeClasses = {
    compact: 'p-3',
    normal: 'p-4',
    large: 'p-5',
};

const iconSizeClasses = {
    compact: 'w-8 h-8',
    normal: 'w-10 h-10',
    large: 'w-12 h-12',
};

export function GroupCard({
    group,
    onToggle,
    onEdit,
    onDelete,
    onAddLink,
    onEditLink,
    onDeleteLink,
    index,
    size = 'normal',
    dragHandleProps,
    isDragging,
}: GroupCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`glass-card glass-card-hover overflow-hidden animate-fade-up stagger-${Math.min(index + 1, 6)} ${isDragging ? 'shadow-ios-xl scale-[1.02]' : ''}`}
            style={{ animationFillMode: 'backwards' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Collapsible open={group.isExpanded} onOpenChange={onToggle}>
                {/* Group Header */}
                <div className={`flex items-center gap-3 ${sizeClasses[size]}`}>
                    {/* Drag Handle */}
                    <div
                        className={`transition-opacity cursor-grab active:cursor-grabbing touch-none ${isHovered ? 'opacity-50' : 'opacity-0'}`}
                        {...dragHandleProps}
                    >
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Icon */}
                    <div
                        className={`flex-shrink-0 ${iconSizeClasses[size]} rounded-xl flex items-center justify-center transition-transform hover:scale-110`}
                        style={{ backgroundColor: group.color + '20' }}
                    >
                        <GroupIcon icon={group.icon} className="w-5 h-5" style={{ color: group.color }} />
                    </div>

                    {/* Title & Count */}
                    <CollapsibleTrigger className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold text-foreground ${size === 'large' ? 'text-lg' : ''}`}>{group.name}</h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {group.links.length}
                            </span>
                        </div>
                    </CollapsibleTrigger>

                    {/* Actions */}
                    <button
                        onClick={() => onAddLink(group.id)}
                        className="ios-button-ghost p-2 rounded-xl"
                        aria-label="Добавить ссылку"
                    >
                        <Plus className="w-5 h-5 text-primary" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="ios-button-ghost p-2 rounded-xl">
                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-border/50">
                            <DropdownMenuItem onClick={() => onEdit(group)} className="gap-2">
                                <Pencil className="w-4 h-4" />
                                Редактировать группу
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(group.id)}
                                className="gap-2 text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                                Удалить группу
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Chevron */}
                    <CollapsibleTrigger asChild>
                        <button className="ios-button-ghost p-2 rounded-xl">
                            <ChevronDown
                                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${group.isExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </CollapsibleTrigger>
                </div>

                {/* Links */}
                <CollapsibleContent>
                    <div className={`px-4 pb-4 space-y-2`}>
                        {group.links.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                Ссылок нет. Нажмите +, чтобы добавить.
                            </div>
                        ) : (
                            <SortableContext items={group.links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                {group.links.map((link, linkIndex) => (
                                    <DraggableLinkCard
                                        key={link.id}
                                        link={link}
                                        onEdit={(l) => onEditLink(group.id, l)}
                                        onDelete={(linkId) => onDeleteLink(group.id, linkId)}
                                        index={linkIndex}
                                    />
                                ))}
                            </SortableContext>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
