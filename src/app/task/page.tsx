import { Avatar, Button, Caption, Divider, Subheadline, Text } from "@telegram-apps/telegram-ui";
import { TiUserAdd } from "react-icons/ti";
import { MdWallet } from "react-icons/md";
import Image from "next/image";

export default function Page() {
    return (
        <main className="mt-4 space-y-5">
            <Divider />
            <section className="space-y-3">
                <div className="space-y-2 rounded-xl p-4 bg-white bg-opacity-10">
                    <div className="flex items-center gap-2">
                        <Avatar size={24} src="/logo.png" style={{
                            border: "0.5px solid #FF9900",
                            objectFit: "cover",
                        }} />
                        <Text weight="2">Bitcoin දීප</Text>
                        <Caption>@BitcoinDeepa</Caption>
                    </div>
                    <p className="text-xs">
                        Bitcoin deepa is a community of Bitcoin enthusiasts in Sri Lanka. We share
                        knowledge, help each other, and grow together.
                    </p>
                </div>
                <Button
                    style={{
                        backgroundColor: "#FF9900",
                    }}
                    stretched
                >
                    Join the Community
                </Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <Subheadline weight="2">Setup your Wallet</Subheadline>
                        <Caption>Setup your wallet to receive Bitcoin</Caption>
                    </div>
                    <MdWallet className="text-4xl" />
                </div>
                <Button Component="a" stretched href="https://t.me/BitcoinDeepaBot" style={{
                        backgroundColor: "#FF9900",
                    }}>
                    <span className="flex gap-2">Setup Wallet</span>
                </Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <Subheadline weight="2">Post a Story</Subheadline>
                        <Caption>Share your story with the community</Caption>
                    </div>
                    <div className="relative h-14 w-10 rotate-12 rounded-[5px] bg-white bg-opacity-10 ">
                        <Image
                            src="/logo.png"
                            width={40}
                            height={40}
                            alt="Bitcoin Deepa"
                            className="absolute bottom-0 right-0"
                        />
                    </div>
                </div>
                <Button Component="a" stretched href="/task" style={{
                        backgroundColor: "#FF9900",
                    }}>
                    <span className="flex gap-2">Share Story</span>
                </Button>
            </section>
        </main>
    );
}
