import { useAccount, useReadContract } from "wagmi";
import { useState, useEffect, useMemo } from "react";
import { useUserGiftCards } from "./useGiftCardContract"; // Assuming this hook fetches user gift cards
import { GIFT_CARD_ABI, GIFT_CARD_ADDRESS } from "../utils/constants";
export function useGiftCards() {
    const { address } = useAccount();
    
    // Fetch tokenIds associated with the user
    const { 
        data: tokenIds, 
        isLoading: isLoadingTokenIds, 
        isError: isTokenIdsError 
    } = useUserGiftCards(address);
    
    
   

    // Use wagmi's useContractRead to read data from the contract
    const { data: tokenMetadataResults, isLoading: isLoadingTokenMetadata, isError: isErrorTokenMetadata } = useReadContract({
        address: GIFT_CARD_ADDRESS,
        abi: GIFT_CARD_ABI,
        functionName: 'getUserTokenMetadata',
        args: [address],  // Pass the user's address
        enabled: tokenIds?.length > 0,  // Only run if tokenIds are available
    });
    console.log(tokenMetadataResults)

    // Derive loading and error states for metadata
    const isLoading = useMemo(() => {
        return isLoadingTokenIds || isLoadingTokenMetadata;
    }, [isLoadingTokenIds, isLoadingTokenMetadata]);

    // Process token metadata
    const processedGiftCards = useMemo(() => {
        if (!tokenIds || tokenIds.length === 0) return [];

        return tokenMetadataResults
            ? tokenMetadataResults.map((metadata, index) => {
                  if (!metadata) return null;

                  const { vendor, expiryDate, encryptedData } = metadata;
                  return {
                      tokenId: tokenIds[index].toString(),
                      vendor,
                      expiryDate: new Date(Number(expiryDate) * 1000),
                      encryptedData,
                  };
              }).filter((card) => card !== null)
            : [];
    }, [tokenIds, tokenMetadataResults]);

    return { 
        giftCards: processedGiftCards, 
        isLoading 
    };
}
