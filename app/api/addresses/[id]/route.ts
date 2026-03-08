import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import Database from "better-sqlite3";
import { createPool } from "@/lib/db";

// Use Aurora PostgreSQL in production, SQLite in development
const getDb = () => {
    const pool = createPool();
    if (pool) {
        return { pool, isPostgres: true };
    }
    return { db: new Database("./db.sqlite"), isPostgres: false };
};

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const dbConnection = getDb();

        // Check if address exists
        let address;
        if (dbConnection.isPostgres && dbConnection.pool) {
            const result = await dbConnection.pool.query(
                `SELECT * FROM address WHERE id = $1 AND "userId" = $2`,
                [id, session.user.id]
            );
            address = result.rows[0];
        } else if (dbConnection.db) {
            address = dbConnection.db
                .prepare(`SELECT * FROM address WHERE id = ? AND userId = ?`)
                .get(id, session.user.id);
        }

        if (!address) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        const updates: string[] = [];
        const values: any[] = [];

        if (body.isSaved !== undefined) {
            updates.push(dbConnection.isPostgres ? `"isSaved" = $${values.length + 1}` : "isSaved = ?");
            values.push(body.isSaved);
        }

        if (body.name !== undefined) {
            updates.push(dbConnection.isPostgres ? `name = $${values.length + 1}` : "name = ?");
            values.push(body.name);
        }

        if (body.phone !== undefined) {
            updates.push(dbConnection.isPostgres ? `phone = $${values.length + 1}` : "phone = ?");
            values.push(body.phone || null);
        }

        if (body.addressLine1 !== undefined) {
            updates.push(dbConnection.isPostgres ? `"addressLine1" = $${values.length + 1}` : "addressLine1 = ?");
            values.push(body.addressLine1);
        }

        if (body.addressLine2 !== undefined) {
            updates.push(dbConnection.isPostgres ? `"addressLine2" = $${values.length + 1}` : "addressLine2 = ?");
            values.push(body.addressLine2 || null);
        }

        if (body.city !== undefined) {
            updates.push(dbConnection.isPostgres ? `city = $${values.length + 1}` : "city = ?");
            values.push(body.city);
        }

        if (body.state !== undefined) {
            updates.push(dbConnection.isPostgres ? `state = $${values.length + 1}` : "state = ?");
            values.push(body.state);
        }

        if (body.zipCode !== undefined) {
            updates.push(dbConnection.isPostgres ? `"zipCode" = $${values.length + 1}` : "zipCode = ?");
            values.push(body.zipCode);
        }

        if (body.country !== undefined) {
            updates.push(dbConnection.isPostgres ? `country = $${values.length + 1}` : "country = ?");
            values.push(body.country);
        }

        updates.push(dbConnection.isPostgres ? `"updatedAt" = $${values.length + 1}` : "updatedAt = ?");
        values.push(Date.now());

        if (dbConnection.isPostgres && dbConnection.pool) {
            values.push(id, session.user.id);
            await dbConnection.pool.query(
                `UPDATE address SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND "userId" = $${values.length}`,
                values
            );

            const result = await dbConnection.pool.query(
                `SELECT * FROM address WHERE id = $1`,
                [id]
            );
            return NextResponse.json(result.rows[0]);
        } else if (dbConnection.db) {
            values.push(id, session.user.id);
            dbConnection.db.prepare(
                `UPDATE address SET ${updates.join(", ")} WHERE id = ? AND userId = ?`
            ).run(...values);

            const updatedAddress = dbConnection.db
                .prepare(`SELECT * FROM address WHERE id = ?`)
                .get(id);
            return NextResponse.json(updatedAddress);
        }

        return NextResponse.json({ error: "Database not available" }, { status: 500 });
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

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const dbConnection = getDb();

        if (dbConnection.isPostgres && dbConnection.pool) {
            const result = await dbConnection.pool.query(
                `DELETE FROM address WHERE id = $1 AND "userId" = $2`,
                [id, session.user.id]
            );

            if (result.rowCount === 0) {
                return NextResponse.json({ error: "Address not found" }, { status: 404 });
            }
        } else if (dbConnection.db) {
            const result = dbConnection.db
                .prepare(`DELETE FROM address WHERE id = ? AND userId = ?`)
                .run(id, session.user.id);

            if (result.changes === 0) {
                return NextResponse.json({ error: "Address not found" }, { status: 404 });
            }
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
