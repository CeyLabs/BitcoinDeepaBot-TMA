import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        // Get authorization header
        const headersList = headers();
        const authorization = headersList.get("authorization");

        if (!authorization) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                    message: "Authorization header is required",
                },
                { status: 401 }
            );
        }

        // Extract token from "Bearer <token>" format
        const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : authorization;

        // Parse request body
        const body = await request.json();

        if (!body.package_id) {
            return NextResponse.json(
                {
                    error: "Bad Request",
                    message: "package_id is required",
                },
                { status: 400 }
            );
        }

        // Check KYC status before generating PayHere link
        try {
            const kycResponse = await fetch(`${process.env.API_BASE_URL}/user/kyc/status`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (kycResponse.ok) {
                const kycData = await kycResponse.json();

                if (kycData.status !== "APPROVED") {
                    return NextResponse.json(
                        {
                            error: "KYC Verification Required",
                            message:
                                "Please complete KYC verification before proceeding with payment",
                            kycStatus: kycData.status,
                            redirectTo: "/verification",
                        },
                        { status: 403 }
                    );
                }
            } else {
                // If KYC status check fails, assume KYC is required
                return NextResponse.json(
                    {
                        error: "KYC Verification Required",
                        message: "Please complete KYC verification before proceeding with payment",
                        redirectTo: "/verification",
                    },
                    { status: 403 }
                );
            }
        } catch (kycError) {
            console.error("Error checking KYC status:", kycError);
            return NextResponse.json(
                {
                    error: "KYC Verification Required",
                    message: "Please complete KYC verification before proceeding with payment",
                    redirectTo: "/verification",
                },
                { status: 403 }
            );
        }

        // Make request to external API to get PayHere link
        const response = await fetch(`${process.env.API_BASE_URL}/subscription/payhere-link`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                package_id: body.package_id,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return NextResponse.json(
                {
                    error: "Failed to generate PayHere link",
                    message: errorData || `HTTP ${response.status}: ${response.statusText}`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        console.log("✅ PayHere link generated successfully:", data);
        debugger;

        return NextResponse.json({
            ...data,
            message: "PayHere link generated successfully",
        });
    } catch (error) {
        console.error("❌ Error generating PayHere link:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
