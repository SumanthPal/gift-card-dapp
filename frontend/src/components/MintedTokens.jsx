import { useReadContract } from "wagmi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

import { VENDOR_ENTITY_ABI, VENDOR_CONTRACT_ADDRESS } from "@/app/utils/constants";

export function MintedTokens({ vendorAddress }) {
    const { data: tokenIds, isLoading } = useReadContract({
      address: VENDOR_CONTRACT_ADDRESS,
      abi: VENDOR_ENTITY_ABI,
      functionName: "getTokensByVendor",
      args: [vendorAddress], // 0 for COUPON, 1 for VOUCHE
    });
    console.log(tokenIds)



  
    if (isLoading) return <div>Loading...</div>;
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minted Tokens</CardTitle>
          <CardDescription>View all tokens you have minted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Remaining Uses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokenIds?.map((tokenId) => (
                <TokenRow key={tokenId.toString()} tokenId={tokenId} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
  function TokenRow({ tokenId }) {
    const { data: metadata } = useReadContract({
      address: VENDOR_CONTRACT_ADDRESS,
      abi: VendorEntityABI,
      functionName: "getTokenMetadata",
      args: [tokenId],
    });
  
    if (!metadata) return null;
  
    return (
      <TableRow>
        <TableCell>{tokenId.toString()}</TableCell>
        <TableCell>{metadata.tokenType === 0 ? "Coupon" : "Voucher"}</TableCell>
        <TableCell>{metadata.value.toString()}</TableCell>
        <TableCell>{new Date(Number(metadata.expiryDate) * 1000).toLocaleDateString()}</TableCell>
        <TableCell>{metadata.remainingUses.toString()}</TableCell>
      </TableRow>
    );
  }
  