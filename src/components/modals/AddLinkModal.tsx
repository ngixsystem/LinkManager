import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Link } from '@/types/link';
import { getFaviconUrl, ensureProtocol, isValidUrl } from '@/utils/favicon';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddLinkModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (link: Omit<Link, 'id' | 'createdAt'>) => void;
    editLink?: Link | null;
}

export function AddLinkModal({ open, onClose, onSave, editLink }: AddLinkModalProps) {
    const [title, setTitle] = useState(editLink?.title || '');
    const [url, setUrl] = useState(editLink?.url || '');
    const [favicon, setFavicon] = useState<string | undefined>(editLink?.favicon);
    const [faviconError, setFaviconError] = useState(false);

    useEffect(() => {
        if (url && isValidUrl(ensureProtocol(url))) {
            const faviconUrl = getFaviconUrl(ensureProtocol(url));
            // Only auto-set if favicon is empty or was auto-set previously (heuristic: contains google)
            // Actually, simplest is to just set it, users can override below.
            if (!favicon || favicon.includes('google.com')) {
                setFavicon(faviconUrl);
                setFaviconError(false);
            }
        }
    }, [url]);

    useEffect(() => {
        if (editLink) {
            setTitle(editLink.title);
            setUrl(editLink.url);
            setFavicon(editLink.favicon);
        }
    }, [editLink]);

    const handleSave = () => {
        if (!title.trim() || !url.trim()) return;
        const finalUrl = ensureProtocol(url);
        onSave({
            title: title.trim(),
            url: finalUrl,
            favicon: !faviconError ? favicon : undefined
        });
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setUrl('');
        setFavicon(undefined);
        setFaviconError(false);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="glass-card-elevated border-border/50 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {editLink ? 'Edit Link' : 'Add Link'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Preview */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-ios-sm overflow-hidden">
                            {favicon && !faviconError ? (
                                <img
                                    src={favicon}
                                    alt=""
                                    className="w-8 h-8 object-contain"
                                    onError={() => setFaviconError(true)}
                                />
                            ) : (
                                <Globe className="w-6 h-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-foreground">
                                {title || 'Link title'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                                {url || 'https://example.com'}
                            </p>
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <Label htmlFor="link-title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="link-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter link title"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                            autoFocus
                        />
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label htmlFor="link-url" className="text-sm font-medium">
                            URL
                        </Label>
                        <Input
                            id="link-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            type="url"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Favicon Input */}
                    <div className="space-y-2">
                        <Label htmlFor="link-favicon" className="text-sm font-medium">
                            Custom Icon URL (Optional)
                        </Label>
                        <Input
                            id="link-favicon"
                            value={favicon || ''}
                            onChange={(e) => {
                                setFavicon(e.target.value);
                                setFaviconError(false);
                            }}
                            placeholder="https://example.com/icon.png"
                            className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !url.trim()}
                        className="w-full ios-button-primary h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editLink ? 'Save Changes' : 'Add Link'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
