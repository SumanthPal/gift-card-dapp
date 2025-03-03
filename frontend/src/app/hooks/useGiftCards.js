import { useAccount } from "wagmi";
import { useGiftCardContract } from "./useGiftCardContract";
import { useState, useEffect } from "react";

export function useGiftCards() {
    const { address} = useAccount();
    const { useUserGiftCards: getUserGiftCards, useTokenMetadata } = useGiftCardContract();
    const { data: tokenIds, isLoading: isLoadingTokenIds } = getUserGiftCards(address);

    const [giftCards, setGiftCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchMetaData() {
            if (!tokenIds || tokenIds.length === 0) {
                setGiftCards([]);
                setIsLoading(false);
                return;
            }

            try {
                const fetchedCards = await Promise.all(
                    tokenIds.map(async (tokenId) => {
                      const { data } = useTokenMetadata(tokenId);
                      if (!data) return null;
                      
                      const [vendor, expiryDate, encryptedData] = data;
                      return {
                        tokenId: tokenId.toString(),
                        vendor,
                        expiryDate: new Date(Number(expiryDate) * 1000),
                        encryptedData,
                      };
                    })
                  );
            } catch (error) {
                console.error(`error loading metadata ${error}`);
            } finally {
                setIsLoading(false);
            }

        } 
        if (tokenIds) {
            fetchMetaData();
        }
    }, [tokenIds]);
    return { giftCards, isLoading: isLoading || isLoadingTokenIds };

}