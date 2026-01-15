import { useState, useEffect, useCallback, useRef } from 'react';
import { LinkGroup, Link } from '@/types/link';

const defaultGroups: LinkGroup[] = [
    {
        id: '1',
        name: 'Work',
        color: 'hsl(211 100% 50%)',
        icon: 'briefcase',
        isExpanded: true,
        createdAt: new Date(),
        links: [
            { id: '1', title: 'GitHub', url: 'https://github.com', createdAt: new Date() },
            { id: '2', title: 'Stack Overflow', url: 'https://stackoverflow.com', createdAt: new Date() },
        ],
    },
    {
        id: '2',
        name: 'Social',
        color: 'hsl(330 80% 60%)',
        icon: 'heart',
        isExpanded: false,
        createdAt: new Date(),
        links: [
            { id: '3', title: 'Twitter', url: 'https://twitter.com', createdAt: new Date() },
            { id: '4', title: 'LinkedIn', url: 'https://linkedin.com', createdAt: new Date() },
        ],
    },
];

export function useLinks() {
    const [groups, setGroups] = useState<LinkGroup[]>([]);
    const isFirstLoad = useRef(true);

    // Fetch initial data
    useEffect(() => {
        fetch('/api/data/groups')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("No data");
            })
            .then(data => {
                // Date parsing revival needed for createdAt? 
                // For simplicity, we just trust the strings or re-parse if needed.
                // Typescript might complain if dates are strings, but JSON handles it as strings.
                // Let's assume the UI handles Date | string or we assume string.
                // Ideally we map and convert dates.
                setGroups(data);
            })
            .catch(() => {
                // Fallback
                const stored = localStorage.getItem('link-manager-groups');
                if (stored) {
                    try {
                        setGroups(JSON.parse(stored));
                        // Sync fallback to server
                        saveToServer(JSON.parse(stored));
                    } catch {
                        setGroups(defaultGroups);
                    }
                } else {
                    setGroups(defaultGroups);
                }
            })
            .finally(() => {
                isFirstLoad.current = false;
            });
    }, []);

    const saveToServer = async (newGroups: LinkGroup[]) => {
        try {
            await fetch('/api/data/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGroups)
            });
            localStorage.setItem('link-manager-groups', JSON.stringify(newGroups));
        } catch (e) {
            console.error("Failed to save groups", e);
        }
    };

    // Debounced Save
    useEffect(() => {
        if (isFirstLoad.current) return;
        const timeout = setTimeout(() => {
            saveToServer(groups);
        }, 500);
        return () => clearTimeout(timeout);
    }, [groups]);


    const addGroup = useCallback((group: Omit<LinkGroup, 'id' | 'links' | 'createdAt' | 'isExpanded'>) => {
        const newGroup: LinkGroup = {
            ...group,
            id: Date.now().toString(),
            links: [],
            isExpanded: true,
            createdAt: new Date(),
        };
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
    }, []);

    const updateGroup = useCallback((id: string, updates: Partial<LinkGroup>) => {
        setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    }, []);

    const deleteGroup = useCallback((id: string) => {
        setGroups(prev => prev.filter(g => g.id !== id));
    }, []);

    const toggleGroup = useCallback((id: string) => {
        setGroups(prev => prev.map(g =>
            g.id === id ? { ...g, isExpanded: !g.isExpanded } : g
        ));
    }, []);

    const addLink = useCallback((groupId: string, link: Omit<Link, 'id' | 'createdAt'>) => {
        const newLink: Link = {
            ...link,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, links: [...g.links, newLink] }
                : g
        ));
        return newLink;
    }, []);

    const updateLink = useCallback((groupId: string, linkId: string, updates: Partial<Link>) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, links: g.links.map(l => l.id === linkId ? { ...l, ...updates } : l) }
                : g
        ));
    }, []);

    const deleteLink = useCallback((groupId: string, linkId: string) => {
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, links: g.links.filter(l => l.id !== linkId) }
                : g
        ));
    }, []);

    const reorderGroups = useCallback((fromIndex: number, toIndex: number) => {
        setGroups(prev => {
            const result = [...prev];
            const [removed] = result.splice(fromIndex, 1);
            result.splice(toIndex, 0, removed);
            return result;
        });
    }, []);

    const reorderLinks = useCallback((groupId: string, fromIndex: number, toIndex: number) => {
        setGroups(prev => prev.map(g => {
            if (g.id !== groupId) return g;
            const links = [...g.links];
            const [removed] = links.splice(fromIndex, 1);
            links.splice(toIndex, 0, removed);
            return { ...g, links };
        }));
    }, []);

    return {
        groups,
        addGroup,
        updateGroup,
        deleteGroup,
        toggleGroup,
        addLink,
        updateLink,
        deleteLink,
        reorderGroups,
        reorderLinks,
    };
}
