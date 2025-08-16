"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBackButton } from "@telegram-apps/sdk-react";
import { Avatar, Button, Divider, Title } from "@telegram-apps/telegram-ui";
import { TiUserAdd } from "react-icons/ti";
import { MdWallet } from "react-icons/md";
import Image from "next/image";
import ShareStory from "@/components/shareStory";
import { SiBitcoin } from "react-icons/si";
import { FaTelegramPlane } from "react-icons/fa";
import { CopyLink, ShareOn_X_WhatsApp } from "@/components/socialShare";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";
import { useStore } from "@/lib/store";
import UserCount from "@/components/usercount";

export default function Page() {
    const { userID, isExistingUser } = useStore();
    const router = useRouter();
    const backButton = useBackButton();
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        backButton.show();
        const handleClick = () => router.push("/");
        backButton.on("click", handleClick);
        return () => {
            backButton.off("click", handleClick);
            backButton.hide();
        };
    }, [backButton, router]);

    useEffect(() => {
        const token = getAuthTokenFromStorage();
        const existing = isExistingUser || getIsExistingUserFromStorage();
        if (token || existing) {
            setRedirecting(true);
            const t = setTimeout(() => router.push("/dashboard"), 3000);
            return () => clearTimeout(t);
        }
    }, [isExistingUser, router]);

    return (
        <main className="mt-4 space-y-10 p-5">
            {redirecting && (
                <p className="text-center text-sm">Redirecting to wallet…</p>
            )}
            <section className="flex flex-col items-center justify-center text-center">
                <Image src="/logo.png" width={250} height={250} alt="Bitcoin Deepa" />
                <Title weight="2">Join Sri Lanka&apos;s Fastest Growing Bitcoin Community 🇱🇰</Title>
                <UserCount />
            </section>
            <Divider />
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <h1 className="text-lg font-semibold">Share your Referral on Socials</h1>
                        <p className="text-sm">Share BitcoinDeepa with your friends and family</p>
                    </div>
                </div>
                <CopyLink />
                <div className="flex gap-2 pt-3">
                    <Button
                        Component="a"
                        stretched
                        href={`https://t.me/share/url?url=https://t.me/bitcoindeepabot/private_invite%3Fstartapp%3D${userID}&text=%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%C2%AD%0A%F0%9F%9A%80%20Here%E2%80%99s%20a%20link%20to%20get%20some%20Free%20Satoshis%2C%20the%20bitcoin%20wallet%20I%20was%20telling%20you%20about%21`}
                    >
                        <span className="flex gap-2 text-sm">
                            <FaTelegramPlane className="text-xl" />
                            Share
                        </span>
                    </Button>
                    <ShareOn_X_WhatsApp />
                </div>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <h1 className="text-lg font-semibold">Setup your Wallet</h1>
                        <p className="text-sm">Setup your wallet to receive Bitcoin</p>
                    </div>
                    <SiBitcoin className="text-4xl" />
                </div>
                <Button Component="a" stretched href="https://t.me/BitcoinDeepaBot">
                    <span className="flex gap-2">
                        Setup Wallet
                        <MdWallet className="text-xl" />
                    </span>
                </Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <h1 className="text-lg font-semibold">Post a Story</h1>
                        <p className="text-sm">Share your story with the community</p>
                    </div>
                    <div className="relative h-14 w-10 rotate-12 rounded-[5px] bg-white bg-opacity-10">
                        <Image
                            src="/logo.png"
                            width={40}
                            height={40}
                            alt="Bitcoin Deepa"
                            className="absolute bottom-0 right-0"
                        />
                    </div>
                </div>
                <ShareStory />
            </section>
            <section className="space-y-3">
                <div className="space-y-2 rounded-xl bg-white bg-opacity-10 p-4">
                    <div className="flex items-center gap-2">
                        <Avatar
                            size={24}
                            src="/logo.png"
                            style={{
                                border: "0.5px solid #FF9900",
                                objectFit: "cover",
                            }}
                        />
                        <p className="text-sm">Bitcoin දීප</p>
                        <p className="text-xs italic text-gray-300">@BitcoinDeepa</p>
                    </div>
                    <p className="text-xs">
                        Bitcoin deepa is a community of Bitcoin enthusiasts in Sri Lanka. We share
                        knowledge, help each other, and grow together.
                    </p>
                </div>
                <Button stretched Component="a" href="https://t.me/+iiP-rX7ldYxjZWU1">
                    <span className="flex gap-2">
                        Join the Community <TiUserAdd className="text-xl" />
                    </span>
                </Button>
            </section>
        </main>
    );
}
