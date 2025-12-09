import { useState, useCallback } from 'react';
import { useAuth } from '@/context';
import { RolePermissions } from '@/types';

interface UsePinProtectedActionOptions {
    actionType?: 'security' | 'settings' | 'destructive';
    title?: string;
    description?: string;
}

interface UsePinProtectedActionReturn {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    executeWithPin: (action: () => void, options?: UsePinProtectedActionOptions) => void;
    pendingAction: (() => void) | null;
    modalProps: {
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
        title?: string;
        description?: string;
        actionType?: 'security' | 'settings' | 'destructive';
    };
}

/**
 * Hook for executing PIN-protected actions
 * If user has a PIN set, prompts for confirmation before executing
 */
export function usePinProtectedAction(): UsePinProtectedActionReturn {
    const { session } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [modalOptions, setModalOptions] = useState<UsePinProtectedActionOptions>({});

    const openModal = useCallback(() => setIsModalOpen(true), []);
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setPendingAction(null);
        setModalOptions({});
    }, []);

    const executeWithPin = useCallback((action: () => void, options?: UsePinProtectedActionOptions) => {
        // If user has no PIN set, execute immediately
        if (!session.user?.pin) {
            action();
            return;
        }

        // Otherwise, show modal and wait for confirmation
        setPendingAction(() => action);
        setModalOptions(options || {});
        setIsModalOpen(true);
    }, [session.user?.pin]);

    const handleConfirm = useCallback(() => {
        if (pendingAction) {
            pendingAction();
        }
        closeModal();
    }, [pendingAction, closeModal]);

    return {
        isModalOpen,
        openModal,
        closeModal,
        executeWithPin,
        pendingAction,
        modalProps: {
            isOpen: isModalOpen,
            onClose: closeModal,
            onConfirm: handleConfirm,
            ...modalOptions,
        },
    };
}

/**
 * Hook for checking if current user has required permission
 */
export function useRequirePermission(permission: keyof RolePermissions): boolean {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
}

/**
 * Hook for getting all permission-related helpers
 */
export function usePermissions() {
    const { session, hasPermission, canAccessRoom } = useAuth();

    const isAdmin = session.user?.role === 'admin';
    const isUser = session.user?.role === 'user';
    const isGuest = session.user?.role === 'guest';

    return {
        isAdmin,
        isUser,
        isGuest,
        role: session.user?.role || 'guest',
        hasPermission,
        canAccessRoom,
        permissions: session.permissions,
        user: session.user,
    };
}

export default usePinProtectedAction;
