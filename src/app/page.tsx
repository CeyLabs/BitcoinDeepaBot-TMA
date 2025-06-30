"use client";

import { Button, Title } from "@telegram-apps/telegram-ui";
import { BiSolidChevronsRight } from "react-icons/bi";
import Image from "next/image";
import UserCount from "@/components/usercount";

export default function Home() {
    return (
        <main className="grid min-h-screen p-5">
            <section className="flex flex-col items-center justify-center text-center">
                <Image src="/logo.png" width={250} height={250} alt="Bitcoin Deepa" />
                <Title weight="2">Join Sri Lanka&apos;s Fastest Growing Bitcoin Community 🇱🇰</Title>
                <UserCount />
            </section>
            <div className="mt-10 space-y-4">
                <Button Component="a" stretched href="/task">
                    <span className="flex gap-2">
                        Join the Community
                        <BiSolidChevronsRight className="text-xl" />
                    </span>
                </Button>
                <Button
                    Component="a"
                    stretched
                    href="/dashboard"
                    className="border-2 border-solid border-orange-500 bg-orange-500/10 text-orange-500 backdrop-blur-[10px]"
                >
                    <span className="flex gap-2">View Wallet</span>
                </Button>
            </div>
        </main>
    );
}
