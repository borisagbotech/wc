// src/app/api/campaigns/[id]/status/route.js
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), '.data', 'app.db');

export async function PATCH(request, { params }) {
    const { id } = params;
    const { status } = await request.json();

    if (!['Running', 'Paused'].includes(status)) {
        return NextResponse.json(
            { error: 'Statut invalide. Doit être "Running" ou "Paused"' },
            { status: 400 }
        );
    }

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Vérifie que la campagne existe
        const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campagne non trouvée' },
                { status: 404 }
            );
        }

        // Met à jour le statut
        await db.run(
            'UPDATE campaigns SET status = ?, updated_at = ? WHERE id = ?',
            [status, new Date().toISOString(), id]
        );

        return NextResponse.json({
            id: parseInt(id),
            status,
            updated_at: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du statut de la campagne' },
            { status: 500 }
        );
    }
}