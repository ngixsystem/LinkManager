import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GroupCard } from './GroupCard';
import { LinkGroup, Link } from '@/types/link';

interface DraggableGroupCardProps {
  group: LinkGroup;
  onToggle: () => void;
  onEdit: (group: LinkGroup) => void;
  onDelete: (groupId: string) => void;
  onAddLink: (groupId: string) => void;
  onEditLink: (groupId: string, link: Link) => void;
  onDeleteLink: (groupId: string, linkId: string) => void;
  index: number;
  size: 'compact' | 'normal' | 'large';
}

export function DraggableGroupCard(props: DraggableGroupCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <GroupCard
        {...props}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}
