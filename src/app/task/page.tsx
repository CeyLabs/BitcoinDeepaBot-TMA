import { Avatar, Button, Caption, Divider, Subheadline, Text } from "@telegram-apps/telegram-ui";
import { TiUserAdd } from "react-icons/ti";
import { MdWallet } from "react-icons/md";
import Image from "next/image";
import ShareStory from "@/components/shareStory";
import { SiBitcoin } from "react-icons/si";

export default function Page() {
    return (
        <main className="mt-4 space-y-10">
            <Divider />
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
                <Button
                    style={{
                        backgroundColor: "#FF9900",
                    }}
                    stretched
                    Component="a"
                    href="https://t.me/+iiP-rX7ldYxjZWU1"
                >
                    <span className="flex gap-2">
                        Join the Community <TiUserAdd className="text-xl" />
                    </span>
                </Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <h1 className="text-lg font-semibold">Setup your Wallet</h1>
                        <p className="text-sm">Setup your wallet to receive Bitcoin</p>
                    </div>
                    <SiBitcoin className="text-4xl" />
                </div>
                <Button
                    Component="a"
                    stretched
                    href="https://t.me/BitcoinDeepaBot"
                    style={{
                        backgroundColor: "#FF9900",
                    }}
                >
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
        </main>
    );
}
