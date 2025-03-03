import { useReadContract, useWriteContract, usePrepareContractWrite } from "wagmi";
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from "../lib/constants";

export function useGiftCardContract() {
    const useUserGiftCards = (address) => {
        return useReadContract({
          address: GIFT_CARD_ADDRESS,
          abi: GIFT_CARD_ABI,
          functionName: 'getUserGiftCards',
          args: [address],
          enabled: !!address,
        });
      };
    
    const useTokenMetaData = (address) => {
        return useReadContract({
            address: GIFT_CARD_ADDRESS,
            abi: GIFT_CARD_ABI,
            functionName: 'getTokenMetadata',
            args: [tokenId],
            enabled: !!tokenId,
      
        })
    }

    const useSendGiftcard = (to, tokenId) => {
        const { config } = usePrepareContractWrite({
            address: GIFT_CARD_ADDRESS,
            abi: GIFT_CARD_ABI,
            functionName: 'sendGiftCard',
            args: [to, tokenId],
            enabled: !!to && !!tokenId,
          });

          return useWriteContract(config);
    }

    const useMintGiftCard = (user, tokenId, vendor, expiryDate, encryptedData) => {
        const { config } = usePrepareContractWrite({
          address: GIFT_CARD_ADDRESS,
          abi: GIFT_CARD_ABI,
          functionName: 'mintGiftCard',
          args: [user, tokenId, vendor, expiryDate, encryptedData],
          enabled: !!user && !!tokenId && !!vendor && !!expiryDate && !!encryptedData,
        });

        return useWriteContract(config);
    }

    return {
        useUserGiftCards,
        useTokenMetaData,
        useSendGiftcard,
        useMintGiftCard,
    }


      
}