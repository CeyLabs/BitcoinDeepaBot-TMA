"use client";

import { Button, Title } from "@telegram-apps/telegram-ui";
import { BiSolidChevronsRight } from "react-icons/bi";
import Image from "next/image";
import UserCount from "@/components/usercount";
import { useEffect, useMemo, useState } from "react";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import fetchy from "@/lib/fetchy";
import { useStore } from "@/lib/store";
import { getAuthTokenFromStorage, getIsExistingUserFromStorage } from "@/lib/auth";

export default function Home() {
    const initLaunchParams = useLaunchParams().initData;
    const launchParams = useLaunchParams();
    const initData = useInitData();
    const { setUserID, isExistingUser } = useStore();
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    const authData = useMemo(() => {
        return initLaunchParams || initData;
    }, [initLaunchParams, initData]);

    useEffect(() => {
        const { username, id } = authData?.user || {};

        async function addUserToDb() {
            if (id && username) {
                try {
                    await fetchy.post("/api/user", {
                        id: id,
                        username: username,
                        data: {
                            authdata: authData,
                            launchparam: launchParams,
                        },
                    });
                } catch (error) {
                    console.error("Error adding user to database:", error);
                }
            }
        }

        addUserToDb();
        setUserID(id?.toString() || "");
    }, [authData, launchParams, setUserID]);

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
        <main className="grid min-h-screen p-5">
            {redirecting && (
                <p className="text-center text-sm">Redirecting to wallet…</p>
            )}
            <section className="flex flex-col items-center justify-center text-center">
                <div className="relative h-[160px] w-[160px]">
                    <Image
                        src="/BDLogo_White.svg"
                        alt="Bitcoin Deepa"
                        fill
                        priority
                        sizes="160px"
                    />
                </div>
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
