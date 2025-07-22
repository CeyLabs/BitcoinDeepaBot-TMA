"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { FaXTwitter, FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { IoCopyOutline } from "react-icons/io5";
import { IoMdShareAlt } from "react-icons/io"; // IoMdShareAlt lives in the old Ionicons set
import { MdGroups } from "react-icons/md";
import { cn } from "@/lib/cn";

export default function InvitePage() {
    const [activeTab, setActiveTab] = useState<"reward" | "frens" | "group">("reward");
    const [copyText, setCopyText] = useState("Copy Link");
    const { userID, rewards, referrals, addReward, count } = useStore();

    const inviteLink = `https://bitcoindeepa.com/invite/${userID}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopyText("Copied!");
            setTimeout(() => setCopyText("Copy Link"), 2000);
        });
    };

    const handleShareStory = () => {
        const storyText = `🚀 Just earned some Bitcoin rewards on Bitcoin දීප! 

Join Sri Lanka's fastest growing Bitcoin community and start earning too! 

${inviteLink}

#BitcoinDeepa #Bitcoin #SriLanka #Crypto`;

        if (navigator.share) {
            navigator
                .share({
                    title: "Bitcoin දීප - Earn Bitcoin Rewards",
                    text: storyText,
                    url: inviteLink,
                })
                .then(() => {
                    addReward(100, "story");
                })
                .catch(console.error);
        } else {
            navigator.clipboard.writeText(storyText).then(() => {
                addReward(100, "story");
                alert("Story copied to clipboard! Share it to earn 100 sats!");
            });
        }
    };

    const handleInviteFriends = () => {
        // Simulate successful invite
        addReward(500, "referral");
        alert("Invite sent! You'll earn 500 sats when your friend joins!");
    };

    const handleSocialShare = (platform: string) => {
        const text = encodeURIComponent(
            `🚀 Join Bitcoin දීප and start earning Bitcoin rewards! ${inviteLink}`
        );
        let url = "";

        switch (platform) {
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${text}`;
                break;
            case "whatsapp":
                url = `https://api.whatsapp.com/send?text=${text}`;
                break;
            case "telegram":
                url = `https://t.me/share/url?url=${inviteLink}&text=${text}`;
                break;
        }

        if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
            // Simulate reward for social sharing
            setTimeout(() => addReward(50, "story"), 1000);
        }
    };

    return (
        <main className="pb-20">
            {/* Tabs */}
            <div className="mb-6 flex rounded-lg bg-gray-800 p-1">
                {[
                    { key: "reward", label: "Reward" },
                    { key: "frens", label: "Frens" },
                    { key: "group", label: "Group" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={cn(
                            "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === tab.key
                                ? "bg-gray-700 text-white"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "reward" && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="text-6xl">😄</div>
                        <div>
                            <h1 className="mb-2 text-2xl font-bold">Invite to Earn Sats</h1>
                            <p className="text-sm leading-relaxed text-gray-400">
                                Score 10% from friends, plus 500 sats from each new member, and 100
                                sats for each story share.
                            </p>
                        </div>
                    </div>

                    {/* Invite Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleInviteFriends}
                            className="w-full rounded-lg bg-orange-600 py-4 font-medium text-white transition-colors hover:bg-orange-700"
                        >
                            Invite Friends
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyLink}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-700 py-3 text-sm text-white transition-colors hover:bg-gray-600"
                            >
                                <IoCopyOutline />
                                {copyText}
                            </button>
                            <button
                                onClick={() => handleSocialShare("twitter")}
                                className="rounded-lg bg-gray-700 p-3 transition-colors hover:bg-gray-600"
                            >
                                <FaXTwitter className="text-lg" />
                            </button>
                            <button
                                onClick={() => handleSocialShare("whatsapp")}
                                className="rounded-lg bg-gray-700 p-3 transition-colors hover:bg-gray-600"
                            >
                                <FaWhatsapp className="text-lg" />
                            </button>
                            <button
                                onClick={() => handleSocialShare("telegram")}
                                className="rounded-lg bg-gray-700 p-3 transition-colors hover:bg-gray-600"
                            >
                                <FaTelegram className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Current Stats */}
                    <div className="rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-600/20 to-orange-500/20 p-4">
                        <h3 className="mb-3 font-medium text-orange-400">Current reward stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="mb-1 text-xs text-orange-300">
                                    +{rewards.withdrawable}
                                </div>
                                <div className="text-2xl font-bold">{rewards.withdrawable}</div>
                                <button className="mt-2 rounded-lg bg-orange-600 px-4 py-1 text-sm text-white transition-colors hover:bg-orange-700">
                                    Withdraw
                                </button>
                            </div>
                            <div className="text-center">
                                <div className="mb-1 text-xs text-orange-300">
                                    +{rewards.referralCount}
                                </div>
                                <div className="text-2xl font-bold text-orange-500">
                                    {rewards.totalEarned}
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                    Sats earned by frens ↓
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleShareStory}
                            className="flex items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-600/20 py-4 font-medium text-orange-400 transition-colors hover:bg-orange-600/30"
                        >
                            <IoMdShareAlt />
                            Share Story
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-orange-500/30 bg-orange-600/20 py-4 font-medium text-orange-400 transition-colors hover:bg-orange-600/30">
                            <MdGroups />
                            GroupUP
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "frens" && (
                <div className="space-y-6">
                    {referrals.length > 0 ? (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold">
                                Your Referrals ({referrals.length})
                            </h2>
                            {referrals.map((referral) => (
                                <div
                                    key={referral.id}
                                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4"
                                >
                                    <div>
                                        <h3 className="font-medium">@{referral.username}</h3>
                                        <p className="text-sm text-gray-400">
                                            Joined {referral.joinDate}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-400">
                                            +{referral.earnings} sats
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {referral.isActive ? "Active" : "Inactive"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 py-12 text-center">
                            <div className="text-6xl">🤔</div>
                            <div>
                                <h2 className="mb-2 text-xl font-semibold">No referrals yet</h2>
                                <p className="text-gray-400">
                                    Your friends haven&apos;t joined yet. Keep inviting!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "group" && (
                <div className="space-y-4 py-12 text-center">
                    <div className="text-6xl">👥</div>
                    <div>
                        <h2 className="mb-2 text-xl font-semibold">Community Groups</h2>
                        <p className="mb-6 text-gray-400">Join our Bitcoin දීප community groups</p>
                        <div className="space-y-3">
                            <button className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                                Join Telegram Group
                            </button>
                            <button className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700">
                                Join WhatsApp Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
