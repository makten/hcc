import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLock, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/context';

interface PinConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    actionType?: 'security' | 'settings' | 'destructive';
}

const ACTION_STYLES = {
    security: {
        icon: <FiLock className="text-amber-400" size={24} />,
        color: 'bg-amber-500',
        hoverColor: 'hover:bg-amber-600',
        bgGradient: 'from-amber-500/20 to-orange-500/20',
        borderColor: 'border-amber-500/30',
    },
    settings: {
        icon: <FiLock className="text-cyan-400" size={24} />,
        color: 'bg-cyan-500',
        hoverColor: 'hover:bg-cyan-600',
        bgGradient: 'from-cyan-500/20 to-purple-500/20',
        borderColor: 'border-cyan-500/30',
    },
    destructive: {
        icon: <FiAlertTriangle className="text-red-400" size={24} />,
        color: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        bgGradient: 'from-red-500/20 to-orange-500/20',
        borderColor: 'border-red-500/30',
    },
};

export function PinConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'PIN Required',
    description = 'Enter your PIN to continue with this action',
    actionType = 'security',
}: PinConfirmModalProps) {
    const { session, verifyPin, userHasPin } = useAuth();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const styles = ACTION_STYLES[actionType];
    const MAX_ATTEMPTS = 3;

    // Check if current user has a PIN set
    const hasPinSet = session.user ? userHasPin(session.user.id) : false;

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            // Focus first input after modal opens
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [isOpen]);

    // If user doesn't have a PIN set, auto-confirm
    useEffect(() => {
        if (isOpen && session.user && !hasPinSet) {
            onConfirm();
            onClose();
        }
    }, [isOpen, session.user, hasPinSet, onConfirm, onClose]);

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = pin.split('');
        newPin[index] = value;
        const updatedPin = newPin.join('').slice(0, 4);
        setPin(updatedPin);
        setError('');

        // Move to next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when 4 digits entered
        if (updatedPin.length === 4) {
            handleSubmit(updatedPin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSubmit = async (pinToVerify: string = pin) => {
        if (pinToVerify.length !== 4) {
            setError('Please enter a 4-digit PIN');
            return;
        }

        setIsVerifying(true);
        try {
            const isValid = await verifyPin(pinToVerify);
            if (isValid) {
                onConfirm();
                onClose();
                setAttempts(0);
            } else {
                setAttempts(prev => prev + 1);
                setPin('');
                inputRefs.current[0]?.focus();

                if (attempts + 1 >= MAX_ATTEMPTS) {
                    setError(`Too many attempts. Please try again later.`);
                    setTimeout(() => {
                        onClose();
                        setAttempts(0);
                    }, 2000);
                } else {
                    setError(`Invalid PIN. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
                }
            }
        } catch {
            setError('Failed to verify PIN');
        } finally {
            setIsVerifying(false);
        }
    };

    if (!hasPinSet) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`w-full max-w-sm rounded-2xl bg-gradient-to-br ${styles.bgGradient} border ${styles.borderColor} backdrop-blur-xl overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#131720]/90 p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <FiX size={20} />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${styles.bgGradient} flex items-center justify-center`}>
                                    {styles.icon}
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                                <p className="text-white/50 text-sm">{description}</p>
                            </div>

                            {/* PIN Input */}
                            <div className="flex justify-center gap-3 mb-4">
                                {[0, 1, 2, 3].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={pin[index] || ''}
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`w-14 h-14 rounded-xl bg-white/5 border text-center text-2xl text-white font-bold focus:outline-none transition-colors ${error ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Error message */}
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-400 text-sm text-center mb-4"
                                >
                                    {error}
                                </motion.p>
                            )}

                            {/* Submit button */}
                            <button
                                onClick={() => handleSubmit()}
                                disabled={pin.length !== 4 || attempts >= MAX_ATTEMPTS || isVerifying}
                                className={`w-full py-3 rounded-xl ${styles.color} text-white font-medium ${styles.hoverColor} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isVerifying ? (
                                    <span className="animate-spin">⏳</span>
                                ) : (
                                    <>
                                        <FiCheck size={18} />
                                        Confirm
                                    </>
                                )}
                            </button>

                            {/* User info */}
                            <p className="text-center text-white/30 text-xs mt-4">
                                Confirming as {session.user?.name}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PinConfirmModal;
