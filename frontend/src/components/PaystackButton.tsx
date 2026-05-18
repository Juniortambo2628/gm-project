"use client";

import { usePaystackPayment } from "react-paystack";
import { CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetting } from "@/context/SettingContext";

interface PaystackButtonProps {
    email: string;
    amountInCents: number;
    serviceName: string;
    isRecording: boolean;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    disabled?: boolean;
}

export default function PaystackButton({ 
    email, 
    amountInCents, 
    serviceName, 
    isRecording, 
    onSuccess, 
    onClose,
    disabled 
}: PaystackButtonProps) {
    const { getSetting } = useSetting();

    const paystackConfig = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amountInCents,
        publicKey: getSetting('paystack_public_key') || 'pk_test_d2d6d06d4e2a6d4e2a6d4e2a6d4e2a6d4e2a', // Dynamically loaded
    };

    const initializePayment = usePaystackPayment(paystackConfig);

    return (
        <Button 
            type="submit"
            disabled={isRecording || disabled}
            onClick={(e) => {
                e.preventDefault();
                initializePayment({ onSuccess, onClose });
            }}
            className="w-full h-20 rounded-[30px] bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 font-bold text-sm group disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isRecording ? (
                <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Confirming...</>
            ) : (
                <>
                    <CreditCard className="mr-3 group-hover:scale-110 transition-transform" size={20} />
                    Confirm & Pay {serviceName || 'Session'} <ArrowRight className="ml-2" />
                </>
            )}
        </Button>
    );
}
