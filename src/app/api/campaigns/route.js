import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const dbPath = process.env.NODE_ENV === 'production'
    ? '/tmp/app.db'
    : path.join(process.cwd(), '.data', 'app.db');

// Fonction utilitaire pour la connexion à la base de données
async function getDb() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
}

// Vérifier et créer la table si nécessaire
async function ensureTableExists() {
    const db = await getDb();
    try {
        const tableExists = await db.get(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='campaigns'"
        );

        if (!tableExists) {
            await db.exec(`
        CREATE TABLE IF NOT EXISTS campaigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          client_name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'Pending',
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Ajouter des données de test
            await db.run(
                'INSERT INTO campaigns (name, client_name, description, status, user_id) VALUES (?, ?, ?, ?, ?)',
                ['Campagne de test', 'Client Test', 'Ceci est une campagne de test', 'Pending', 1]
            );
        }
        return true;
    } catch (error) {
        console.error('Erreur lors de la vérification/création de la table:', error);
        return false;
    } finally {
        await db.close();
    }
}

// GET /api/campaigns - Récupère les campagnes de l'utilisateur
export async function GET(request) {
    try {
        // Vérifier que la table existe
        const tableReady = await ensureTableExists();
        if (!tableReady) {
            return NextResponse.json(
                { error: 'Erreur de configuration de la base de données' },
                { status: 500 }
            );
        }

        // Récupérer l'ID de l'utilisateur connecté
        const userId = request.headers.get('x-user-id') || 1; // À remplacer par l'ID de l'utilisateur connecté

        if (!userId) {
            return NextResponse.json(
                { error: 'Utilisateur non identifié' },
                { status: 401 }
            );
        }

        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const client = searchParams.get('client');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 10;
        const offset = (page - 1) * limit;

        // Construire la requête
        const db = await getDb();
        let query = 'SELECT * FROM campaigns WHERE user_id = ?';
        const params = [userId];
        const whereClauses = [];

        // Filtres
        if (status) {
            whereClauses.push('status = ?');
            params.push(status);
        }
        if (client) {
            whereClauses.push('client_name LIKE ?');
            params.push(`%${client}%`);
        }
        if (search) {
            whereClauses.push('(name LIKE ? OR description LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Ajouter les clauses WHERE supplémentaires
        if (whereClauses.length > 0) {
            query += ' AND ' + whereClauses.join(' AND ');
        }

        // Compter le total
        const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
        const countResult = await db.get(countQuery, params);
        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Ajouter la pagination
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        // Exécuter la requête
        const campaigns = await db.all(query, params);

        return NextResponse.json({
            success: true,
            data: campaigns,
            pagination: {
                total,
                totalPages,
                page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des campagnes:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des campagnes' },
            { status: 500 }
        );
    }
}

// POST /api/campaigns - Crée une nouvelle campagne
export async function POST(request) {
    try {
        // Vérifier que la table existe
        const tableReady = await ensureTableExists();
        if (!tableReady) {
            return NextResponse.json(
                { error: 'Erreur de configuration de la base de données' },
                { status: 500 }
            );
        }

        // Récupérer l'ID de l'utilisateur connecté
        const userId = request.headers.get('x-user-id') || 1; // À remplacer par l'ID de l'utilisateur connecté

        if (!userId) {
            return NextResponse.json(
                { error: 'Utilisateur non identifié' },
                { status: 401 }
            );
        }

        // Valider les données de la requête
        const { name, client_name, description } = await request.json();

        if (!name || !client_name) {
            return NextResponse.json(
                { error: 'Le nom et le client sont obligatoires' },
                { status: 400 }
            );
        }

        // Insérer la nouvelle campagne
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO campaigns (name, client_name, description, status, user_id) VALUES (?, ?, ?, ?, ?)',
            [name, client_name, description || null, 'Pending', userId]
        );

        // Récupérer la campagne créée
        const newCampaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [result.lastID]);

        return NextResponse.json({
            success: true,
            data: newCampaign
        }, { status: 201 });

    } catch (error) {
        console.error('Erreur lors de la création de la campagne:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la campagne' },
            { status: 500 }
        );
    }
}