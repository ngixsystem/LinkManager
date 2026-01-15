import { useState } from 'react';
import { X } from 'lucide-react';
import { GROUP_COLORS, GROUP_ICONS, LinkGroup } from '@/types/link';
import { GroupIcon } from '../icons/GroupIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (group: Omit<LinkGroup, 'id' | 'links' | 'createdAt' | 'isExpanded'>) => void;
  editGroup?: LinkGroup | null;
}

export function AddGroupModal({ open, onClose, onSave, editGroup }: AddGroupModalProps) {
  const [name, setName] = useState(editGroup?.name || '');
  const [color, setColor] = useState(editGroup?.color || GROUP_COLORS[0].value);
  const [icon, setIcon] = useState(editGroup?.icon || GROUP_ICONS[0]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, icon });
    setName('');
    setColor(GROUP_COLORS[0].value);
    setIcon(GROUP_ICONS[0]);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
      setColor(GROUP_COLORS[0].value);
      setIcon(GROUP_ICONS[0]);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-card-elevated border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editGroup ? 'Edit Group' : 'New Group'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Color</Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 4px 12px ${c.value}40` : undefined
                  }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    icon === i
                      ? 'bg-primary text-primary-foreground scale-110 shadow-ios-md'
                      : 'bg-secondary hover:bg-accent hover:scale-105'
                  }`}
                  aria-label={i}
                >
                  <GroupIcon icon={i} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full ios-button-primary h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editGroup ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
