// src/app/api/logs/[campaignId]/route.js
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), '.data', 'app.db');

export async function GET(request, { params }) {
    const { campaignId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Vérifie que la campagne existe
        const campaign = await db.get('SELECT id FROM campaigns WHERE id = ?', [campaignId]);
        if (!campaign) {
            return NextResponse.json(
                { error: 'Campagne non trouvée' },
                { status: 404 }
            );
        }

        let query = 'SELECT * FROM campaign_logs WHERE campaign_id = ?';
        const params = [campaignId];

        if (status) {
            query += ' AND message_status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (recipient LIKE ? OR error_reason LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Compte le nombre total d'éléments
        const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
        const countResult = await db.get(countQuery, params);
        const total = countResult.total;

        // Ajoute la pagination et le tri
        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const logs = await db.all(query, params);

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des logs' },
            { status: 500 }
        );
    }
}