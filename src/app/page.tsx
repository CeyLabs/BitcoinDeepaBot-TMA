"use client";

import { Button, Title } from "@telegram-apps/telegram-ui";
import { BiSolidChevronsRight } from "react-icons/bi";
import Image from "next/image";
import UserCount from "@/components/usercount";
import { useEffect, useMemo } from "react";
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react";
import fetchy from "@/lib/fetchy";
import { useStore } from "@/lib/store";

export default function Home() {
    const initLaunchParams = useLaunchParams().initData;
    const launchParams = useLaunchParams();
    const initData = useInitData();
    const { setUserID } = useStore();

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
    return (
        <main className="grid min-h-screen p-5">
            <section className="flex flex-col items-center justify-center text-center">
                <Image src="/BDLogo_White.svg" width={160} height={160} alt="Bitcoin Deepa" />
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
