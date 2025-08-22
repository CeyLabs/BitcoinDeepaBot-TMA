"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function BtcPriceTicker() {
    const [price, setPrice] = useState<number | null>(null);
    const [prevPrice, setPrevPrice] = useState<number | null>(null);
    const [trend, setTrend] = useState<"up" | "down" | null>(null);
    const priceRef = useRef<number>(0);
    const [rate, setRate] = useState<number | null>(null);

    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch("https://open.er-api.com/v6/latest/USD");
                const data = await res.json();
                setRate(data.rates.LKR);
            } catch (err) {
                console.error("Failed to fetch LKR rate", err);
            }
        };
        fetchRate();
    }, []);

    useEffect(() => {
        if (!rate) return;
        const ws = new WebSocket("wss://ws.coincap.io/prices?assets=bitcoin");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.bitcoin) {
                priceRef.current = parseFloat(data.bitcoin) * rate;
            }
        };
        const interval = setInterval(() => {
            setPrevPrice((p) => price);
            setPrice(priceRef.current);
        }, 1000);
        return () => {
            ws.close();
            clearInterval(interval);
        };
    }, [rate, price]);

    useEffect(() => {
        if (prevPrice === null || price === null) return;
        if (price === prevPrice) return;
        setTrend(price > prevPrice ? "up" : "down");
        const timeout = setTimeout(() => setTrend(null), 500);
        return () => clearTimeout(timeout);
    }, [price, prevPrice]);

    if (price === null) {
        return <div className="text-sm text-gray-400">Loading BTC price...</div>;
    }

    const trendClass =
        trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-white";

    return (
        <motion.div
            key={price}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
            className={`text-sm font-medium ${trendClass}`}
        >
            BTC Price: රු {price.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
        </motion.div>
    );
}

