import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { RolePermissions } from '@/types';

interface RestrictedAccessProps {
    children: ReactNode;
    permission?: keyof RolePermissions;
    roomId?: string;
    fallbackMessage?: string;
    showBackButton?: boolean;
}

/**
 * Component that restricts access based on user permissions.
 * Shows an access denied message if user lacks the required permission.
 */
export function RestrictedAccess({
    children,
    permission,
    roomId,
    fallbackMessage = "You don't have permission to access this area.",
    showBackButton = true,
}: RestrictedAccessProps) {
    const { hasPermission, canAccessRoom, session } = useAuth();
    const navigate = useNavigate();

    // Check permission
    const hasRequiredPermission = permission ? hasPermission(permission) : true;
    const hasRoomAccess = roomId ? canAccessRoom(roomId) : true;
    const hasAccess = hasRequiredPermission && hasRoomAccess;

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] p-8"
        >
            <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <FiLock className="text-red-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-white/50 text-center max-w-md mb-6">{fallbackMessage}</p>

            <div className="flex flex-col items-center gap-2 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
                    <FiShield className="text-white/40" size={16} />
                    <span className="text-white/60 text-sm">
                        Your role: <span className="text-white capitalize">{session.user?.role || 'guest'}</span>
                    </span>
                </div>
                {permission && (
                    <p className="text-xs text-white/30">
                        Required permission: {permission.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                )}
            </div>

            {showBackButton && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <FiArrowLeft size={18} />
                    Go Back
                </button>
            )}
        </motion.div>
    );
}

export default RestrictedAccess;
