import { Button } from "@telegram-apps/telegram-ui";
import { IoMdShareAlt } from "react-icons/io";

export default function Home() {
    return (
        <main className="mt-10">
            <Button  Component="a" stretched href="/task">
                <span className="flex gap-2">
                    Join the Community
                    <IoMdShareAlt className="text-xl"/>
                </span>
            </Button>
        </main>
    );
}
