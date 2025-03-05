import { useReadContract, useWriteContract } from "wagmi";
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from "../utils/constants";

export function useUserGiftCards(address) {
    return useReadContract({
        address: GIFT_CARD_ADDRESS,
        abi: GIFT_CARD_ABI,
        functionName: 'getUserGiftCards',
        args: [address],
        enabled: !!address,
    });
}

export function useTokenMetadata(tokenId) {
    return useReadContract({
        address: GIFT_CARD_ADDRESS,
        abi: GIFT_CARD_ABI,
        functionName: 'getTokenMetadata',
        args: [tokenId],
        enfabled: Boolean(tokenId),
    });
}

export function useSendGiftCard() {
    const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();
    return {
        sendGiftCard: (to, tokenId) =>
            writeContract({
                address: GIFT_CARD_ADDRESS,
                abi: GIFT_CARD_ABI,
                functionName: 'sendGiftCard',
                args: [to, tokenId],
            }),
        isPending,
        isSuccess,
        isError,
        error,
    };
}

export function useMintGiftCard() {
    const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

    return {
     mintGiftCard: (user, tokenId, vendor, expiryDate, encryptedData) => 
        writeContract({
                address: String(GIFT_CARD_ADDRESS),
                abi: GIFT_CARD_ABI,
                functionName: 'mintGiftCard',
                args: [user, tokenId, vendor, expiryDate, encryptedData],
            }),


    
        isPending,
        isSuccess,
        isError,
        error
    };
}

