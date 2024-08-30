import {
    Avatar,
    Button,
    Caption,
    Card,
    Divider,
    Subheadline,
    Text,
    Title,
} from "@telegram-apps/telegram-ui";
import { TiUserAdd } from "react-icons/ti";
import { IoIdCardOutline } from "react-icons/io5";

export default function Page() {
    return (
        <main className="mt-4 space-y-5">
            <Divider />
            <section className="space-y-3">
                <div className="space-y-2 rounded-xl border p-4 shadow-md">
                    <div className="flex items-center gap-2">
                        <Avatar size={24} src="logo.png" />
                        <Text weight="2">Bitcoin දීප</Text>
                        <Caption>@BitcoinDeepa</Caption>
                    </div>
                    <p className="text-xs">
                        Bitcoin deepa is a community of Bitcoin enthusiasts in Sri Lanka. We share
                        knowledge, help each other, and grow together.
                    </p>
                </div>
                <Button stretched>Join the Community</Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <Subheadline weight="2">Setup your Wallet</Subheadline>
                        <Caption>Setup your wallet to receive Bitcoin</Caption>
                    </div>
                    <TiUserAdd className="text-5xl" />
                </div>
                <Button Component="a" stretched href="/task">
                    <span className="flex gap-2">Join the Group</span>
                </Button>
            </section>
            <section>
                <div className="flex items-center justify-between pb-3">
                    <div>
                        <Subheadline weight="2">Post a Story</Subheadline>
                        <Caption>Share your story with the community</Caption>
                    </div>
                    <IoIdCardOutline className="text-5xl" />
                </div>
                <Button Component="a" stretched href="/task">
                    <span className="flex gap-2">Share Story</span>
                </Button>
            </section>
        </main>
    );
}
