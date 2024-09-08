import { Button } from "@telegram-apps/telegram-ui";
import { IoIosArrowDroprightCircle } from "react-icons/io";

export default function Home() {
    return (
        <main className="mt-10">
            <Button Component="a" stretched href="/task">
                <span className="flex gap-2">
                    Join the Community
                    <IoIosArrowDroprightCircle className="text-xl" />
                </span>
            </Button>
        </main>
    );
}
