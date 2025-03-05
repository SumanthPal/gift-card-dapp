"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MintedTokens } from "@/components/MintedTokens";
import { MintTokenForm } from "@/components/MintTokensForm";
import Navbar from "@/components/NavBar";

export default function VendorDashboard() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("minted");

  return (
    <div className="h-[50rem] w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
        <Navbar />
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Vendor Dashboard</h1>
      <Tabs defaultValue="minted" className="w-full">
        <TabsList>
          <TabsTrigger value="minted" onClick={() => setActiveTab("minted")}>
            Minted Tokens
          </TabsTrigger>
          <TabsTrigger value="mint" onClick={() => setActiveTab("mint")}>
            Mint New Token
          </TabsTrigger>
        </TabsList>
        <TabsContent value="minted">
          <MintedTokens vendorAddress={address} />
        </TabsContent>
        <TabsContent value="mint">
          <MintTokenForm vendorAddress={address} />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}