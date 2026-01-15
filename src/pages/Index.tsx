import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useLinks } from '@/hooks/useLinks';
import { useSettings } from '@/hooks/useSettings';
import { LinkGroup, Link } from '@/types/link';
import { Header } from '@/components/Header';
import { DraggableGroupCard } from '@/components/DraggableGroupCard';
import { EmptyState } from '@/components/EmptyState';
import { DynamicBackground } from '@/components/DynamicBackground';
import { AddGroupModal } from '@/components/modals/AddGroupModal';
import { AddLinkModal } from '@/components/modals/AddLinkModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { SettingsModal } from '@/components/modals/SettingsModal';

const Index = () => {
    const {
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
    } = useLinks();

    const { settings, updateSettings, resetSettings } = useSettings();

    // Modal states
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);

    // Edit states
    const [editingGroup, setEditingGroup] = useState<LinkGroup | null>(null);
    const [editingLink, setEditingLink] = useState<Link | null>(null);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

    // Delete states
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
    const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // DnD handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;
        if (active.id === over.id) return;

        // Check if it's a group
        const oldGroupIndex = groups.findIndex((g) => g.id === active.id);
        const newGroupIndex = groups.findIndex((g) => g.id === over.id);

        if (oldGroupIndex !== -1 && newGroupIndex !== -1) {
            reorderGroups(oldGroupIndex, newGroupIndex);
            return;
        }

        // Must be a link
        // Find source group and link index
        let sourceGroupId = '';
        let oldLinkIndex = -1;

        for (const group of groups) {
            const idx = group.links.findIndex(l => l.id === active.id);
            if (idx !== -1) {
                sourceGroupId = group.id;
                oldLinkIndex = idx;
                break;
            }
        }

        // Find destination group and link index
        // Note: 'over.id' could be another link ID, OR a group ID (if dropped on empty group - typically requires Droppable)
        // Here we assume sorting within same group or across groups if we implemented that.
        // For now, let's assume valid sorting only happens if IDs match sortable items.

        // Find target link group
        let targetGroupId = '';
        let newLinkIndex = -1;

        for (const group of groups) {
            const idx = group.links.findIndex(l => l.id === over.id);
            if (idx !== -1) {
                targetGroupId = group.id;
                newLinkIndex = idx;
                break;
            }
        }

        // Support reordering within the SAME group for now
        if (sourceGroupId && targetGroupId && sourceGroupId === targetGroupId && oldLinkIndex !== -1 && newLinkIndex !== -1) {
            reorderLinks(sourceGroupId, oldLinkIndex, newLinkIndex);
        }
    };

    // Group handlers
    const handleAddGroup = () => {
        setEditingGroup(null);
        setGroupModalOpen(true);
    };

    const handleEditGroup = (group: LinkGroup) => {
        setEditingGroup(group);
        setGroupModalOpen(true);
    };

    const handleSaveGroup = (groupData: Omit<LinkGroup, 'id' | 'links' | 'createdAt' | 'isExpanded'>) => {
        if (editingGroup) {
            updateGroup(editingGroup.id, groupData);
        } else {
            addGroup(groupData);
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        setDeletingGroupId(groupId);
        setDeletingLinkId(null);
        setDeleteModalOpen(true);
    };

    // Link handlers
    const handleAddLink = (groupId: string) => {
        setActiveGroupId(groupId);
        setEditingLink(null);
        setLinkModalOpen(true);
    };

    const handleEditLink = (groupId: string, link: Link) => {
        setActiveGroupId(groupId);
        setEditingLink(link);
        setLinkModalOpen(true);
    };

    const handleSaveLink = (linkData: Omit<Link, 'id' | 'createdAt'>) => {
        if (!activeGroupId) return;
        if (editingLink) {
            updateLink(activeGroupId, editingLink.id, linkData);
        } else {
            addLink(activeGroupId, linkData);
        }
    };

    const handleDeleteLink = (groupId: string, linkId: string) => {
        setActiveGroupId(groupId);
        setDeletingLinkId(linkId);
        setDeletingGroupId(null);
        setDeleteModalOpen(true);
    };

    // Confirm delete
    const handleConfirmDelete = () => {
        if (deletingGroupId) {
            deleteGroup(deletingGroupId);
        } else if (deletingLinkId && activeGroupId) {
            deleteLink(activeGroupId, deletingLinkId);
        }
        setDeleteModalOpen(false);
        setDeletingGroupId(null);
        setDeletingLinkId(null);
    };

    return (
        <DynamicBackground settings={settings}>
            <Header
                onAddGroup={handleAddGroup}
                onOpenSettings={() => setSettingsModalOpen(true)}
                settings={settings}
            />

            <main className="w-full px-4 md:px-8 py-8">
                {groups.length === 0 ? (
                    <EmptyState onAddGroup={handleAddGroup} />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={groups.map((g) => g.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                                {groups.map((group, index) => (
                                    <div key={group.id} className="break-inside-avoid">
                                        <DraggableGroupCard
                                            group={group}
                                            index={index}
                                            size={settings.groupSize}
                                            onToggle={() => toggleGroup(group.id)}
                                            onEdit={handleEditGroup}
                                            onDelete={handleDeleteGroup}
                                            onAddLink={handleAddLink}
                                            onEditLink={handleEditLink}
                                            onDeleteLink={handleDeleteLink}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </main>

            {/* Modals */}
            <AddGroupModal
                open={groupModalOpen}
                onClose={() => setGroupModalOpen(false)}
                onSave={handleSaveGroup}
                editGroup={editingGroup}
            />

            <AddLinkModal
                open={linkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                onSave={handleSaveLink}
                editLink={editingLink}
            />

            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={deletingGroupId ? 'Delete Group?' : 'Delete Link?'}
                description={
                    deletingGroupId
                        ? 'This will permanently delete the group and all its links. This action cannot be undone.'
                        : 'This will permanently delete this link. This action cannot be undone.'
                }
            />

            <SettingsModal
                open={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                settings={settings}
                onUpdateSettings={updateSettings}
                onResetSettings={resetSettings}
            />
        </DynamicBackground>
    );
};

export default Index;
