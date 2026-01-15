import { FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  onAddGroup: () => void;
}

export function EmptyState({ onAddGroup }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-up">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <FolderPlus className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No groups yet</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Create your first group to start organizing your favorite links
      </p>
      <button onClick={onAddGroup} className="ios-button-primary">
        Create First Group
      </button>
    </div>
  );
}
