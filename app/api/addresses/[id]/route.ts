import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || "test-user";

    try {
        const { id } = await params;
        const body = await request.json();
        const db = getSupabaseAdmin();

        // Check address belongs to user
        const { data: existing } = await db
            .from('address')
            .select('id')
            .eq('id', id)
            .eq('userId', userId)
            .single();

        if (!existing) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        const updates: Record<string, unknown> = { updatedAt: Date.now() };
        const fields = ['isSaved', 'name', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country'];
        for (const field of fields) {
            if (body[field] !== undefined) {
                updates[field] = body[field] ?? null;
            }
        }

        const { data, error } = await db
            .from('address')
            .update(updates)
            .eq('id', id)
            .eq('userId', userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating address:", error);
            return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating address:", error);
        return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || "test-user";

    try {
        const { id } = await params;
        const db = getSupabaseAdmin();

        const { error, count } = await db
            .from('address')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('userId', userId);

        if (error) {
            console.error("Error deleting address:", error);
            return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
        }

        if (count === 0) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting address:", error);
        return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
    }
}
