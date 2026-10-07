"use client";

import { CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StripeCheckoutButtonProps {
    serviceName: string;
    isLoading: boolean;
    disabled?: boolean;
    /** Shown instead of the pay label while the button is disabled, e.g. to say what's missing. */
    disabledLabel?: string;
    onClick: () => void;
}

export default function StripeCheckoutButton({ 
    serviceName, 
    isLoading, 
    disabled,
    disabledLabel,
    onClick,
}: StripeCheckoutButtonProps) {
    return (
        <Button 
            type="submit"
            disabled={isLoading || disabled}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className="w-full h-20 rounded-[30px] bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 font-bold text-sm group disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Redirecting to payment...</>
            ) : disabled && disabledLabel ? (
                <>{disabledLabel}</>
            ) : (
                <>
                    <CreditCard className="mr-3 group-hover:scale-110 transition-transform" size={20} />
                    Confirm & Pay {serviceName || 'Session'} <ArrowRight className="ml-2" />
                </>
            )}
        </Button>
    );
}
