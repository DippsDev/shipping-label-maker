import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createPool } from "@/lib/db";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Bypass auth for testing
    const userId = session?.user?.id || "test-user";

    try {
        const { id } = await params;
        const body = await request.json();
        const pool = createPool();

        if (!pool) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        // Check if address exists
        const checkResult = await pool.query(
            `SELECT * FROM address WHERE id = $1 AND "userId" = $2`,
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (body.isSaved !== undefined) {
            updates.push(`"isSaved" = $${paramIndex++}`);
            values.push(body.isSaved);
        }

        if (body.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(body.name);
        }

        if (body.phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(body.phone || null);
        }

        if (body.addressLine1 !== undefined) {
            updates.push(`"addressLine1" = $${paramIndex++}`);
            values.push(body.addressLine1);
        }

        if (body.addressLine2 !== undefined) {
            updates.push(`"addressLine2" = $${paramIndex++}`);
            values.push(body.addressLine2 || null);
        }

        if (body.city !== undefined) {
            updates.push(`city = $${paramIndex++}`);
            values.push(body.city);
        }

        if (body.state !== undefined) {
            updates.push(`state = $${paramIndex++}`);
            values.push(body.state);
        }

        if (body.zipCode !== undefined) {
            updates.push(`"zipCode" = $${paramIndex++}`);
            values.push(body.zipCode);
        }

        if (body.country !== undefined) {
            updates.push(`country = $${paramIndex++}`);
            values.push(body.country);
        }

        updates.push(`"updatedAt" = $${paramIndex++}`);
        values.push(Date.now());

        values.push(id, userId);

        await pool.query(
            `UPDATE address SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND "userId" = $${paramIndex++}`,
            values
        );

        const result = await pool.query(
            `SELECT * FROM address WHERE id = $1`,
            [id]
        );
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating address:", error);
        return NextResponse.json(
            { error: "Failed to update address" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Bypass auth for testing
    const userId = session?.user?.id || "test-user";

    try {
        const { id } = await params;
        const pool = createPool();

        if (!pool) {
            return NextResponse.json({ error: "Database not available" }, { status: 500 });
        }

        const result = await pool.query(
            `DELETE FROM address WHERE id = $1 AND "userId" = $2`,
            [id, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting address:", error);
        return NextResponse.json(
            { error: "Failed to delete address" },
            { status: 500 }
        );
    }
}
