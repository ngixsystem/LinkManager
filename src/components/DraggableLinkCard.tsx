import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LinkCard } from './LinkCard';
import { Link } from '@/types/link';

interface DraggableLinkCardProps {
    link: Link;
    onEdit: (link: Link) => void;
    onDelete: (linkId: string) => void;
    index: number;
}

export function DraggableLinkCard(props: DraggableLinkCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.link.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <LinkCard
                {...props}
                dragHandleProps={listeners}
                isDragging={isDragging}
            />
        </div>
    );
}
