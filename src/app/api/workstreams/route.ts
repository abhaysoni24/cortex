import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workstreams } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// GET /api/workstreams
// Returns all active workstreams sorted by sort_order
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const result = await db
      .select({
        id: workstreams.id,
        name: workstreams.name,
        slug: workstreams.slug,
        color: workstreams.color,
        icon: workstreams.icon,
        description: workstreams.description,
        status: workstreams.status,
        sort_order: workstreams.sortOrder,
        created_at: workstreams.createdAt,
        updated_at: workstreams.updatedAt,
      })
      .from(workstreams)
      .where(eq(workstreams.status, 'active'))
      .orderBy(asc(workstreams.sortOrder));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/workstreams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workstreams' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/workstreams
// Body: { name, color?, icon?, description? }
// Auto-generates slug from name
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = body.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const insertValues: Record<string, unknown> = {
      name: body.name.trim(),
      slug,
    };

    if (body.color) insertValues.color = body.color;
    if (body.icon) insertValues.icon = body.icon;
    if (body.description) insertValues.description = body.description;

    const [created] = await db
      .insert(workstreams)
      .values(insertValues as any)
      .returning();

    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        slug: created.slug,
        color: created.color,
        icon: created.icon,
        description: created.description,
        status: created.status,
        sort_order: created.sortOrder,
        created_at: created.createdAt,
        updated_at: created.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/workstreams error:', error);
    return NextResponse.json(
      { error: 'Failed to create workstream' },
      { status: 500 }
    );
  }
}
