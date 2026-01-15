import { AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
}: DeleteConfirmModalProps) {
    // Translate dynamic props if possible, or assume parent passes translated strings.
    // Given current usage in Index.tsx, parent passes English strings.
    // We should probably translate them here based on content or update Index.tsx.
    // Updating Index.tsx is cleaner but more work.
    // Let's check where these are used. Index.tsx uses them.
    // "Delete Group?" -> "Удалить группу?"
    // "Delete Link?" -> "Удалить ссылку?"
    // Descriptions...

    // Simple heuristic translation for now to avoid touching Index.tsx logic deeply if not needed.
    const translatedTitle = title === 'Delete Group?' ? 'Удалить группу?' : (title === 'Delete Link?' ? 'Удалить ссылку?' : title);

    const translatedDesc = description.includes('delete the group')
        ? 'Это действие необратимо удалит группу и все ссылки в ней.'
        : (description.includes('delete this link') ? 'Это действие необратимо удалит эту ссылку.' : description);

    return (
        <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="glass-card-elevated border-border/50 max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        {translatedTitle}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {translatedDesc}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} className="ios-button-secondary border-0">
                        Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="ios-button bg-destructive text-destructive-foreground hover:bg-destructive/90 border-0"
                    >
                        Удалить
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
