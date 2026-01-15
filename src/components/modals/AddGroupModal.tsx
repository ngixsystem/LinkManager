import { useState, useEffect } from 'react';
import { GroupIcon } from '../icons/GroupIcon';
import { LinkGroup } from '@/types/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddGroupModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (group: Omit<LinkGroup, 'id' | 'links' | 'createdAt' | 'isExpanded'>) => void;
    editGroup?: LinkGroup | null;
}

const icons = ['briefcase', 'heart', 'code', 'book', 'gamepad', 'music', 'video', 'coffee', 'home', 'star', 'server', 'cloud', 'shield', 'lock', 'terminal', 'cpu'];
const colors = [
    'hsl(211 100% 50%)', // Blue
    'hsl(292 84% 61%)',  // Purple
    'hsl(330 80% 60%)',  // Pink
    'hsl(142 71% 45%)',  // Green
    'hsl(32 95% 44%)',   // Orange
    'hsl(0 84% 60%)',    // Red
    'hsl(190 90% 40%)',  // Cyan
    'hsl(260 60% 60%)',  // Indigo
];

export function AddGroupModal({ open, onClose, onSave, editGroup }: AddGroupModalProps) {
    const [name, setName] = useState(editGroup?.name || '');
    const [icon, setIcon] = useState(editGroup?.icon || icons[0]);
    const [color, setColor] = useState(editGroup?.color || colors[0]);

    useEffect(() => {
        if (editGroup) {
            setName(editGroup.name);
            setIcon(editGroup.icon);
            setColor(editGroup.color);
        } else {
            setName('');
            setIcon(icons[0]);
            setColor(colors[0]);
        }
    }, [editGroup, open]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name, icon, color });
        handleClose();
    };

    const handleClose = () => {
        setName('');
        setIcon(icons[0]);
        setColor(colors[0]);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass-card-elevated border-border/50 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {editGroup ? 'Редактировать группу' : 'Добавить группу'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="group-name" className="text-sm font-medium">
                            Название группы
                        </Label>
                        <Input
                            id="group-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Иконка</Label>
                        <div className="grid grid-cols-8 gap-2 p-1">
                            {icons.map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`p-2 rounded-lg transition-all ${icon === i
                                            ? 'bg-primary text-primary-foreground scale-110 shadow-ios-sm'
                                            : 'hover:bg-secondary text-muted-foreground'
                                        }`}
                                >
                                    <GroupIcon icon={i} className="w-5 h-5 mx-auto" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Цвет</Label>
                        <div className="grid grid-cols-8 gap-2 p-1">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${color === c
                                            ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-ios-sm'
                                            : 'hover:scale-110'
                                        }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            onClick={onClose}
                            className="ios-button-secondary h-12 flex-1"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="ios-button-primary h-12 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editGroup ? 'Сохранить' : 'Создать'}
                        </button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
