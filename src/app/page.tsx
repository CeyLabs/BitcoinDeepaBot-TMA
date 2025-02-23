import { Button } from "@telegram-apps/telegram-ui";
import { BiSolidChevronsRight } from "react-icons/bi";

export default function Home() {
    return (
        <main className="mt-10">
            <Button Component="a" stretched href="/task">
                <span className="flex gap-2">
                    Join the Community
                    <BiSolidChevronsRight className="text-xl" />
                </span>
            </Button>
        </main>
    );
}
