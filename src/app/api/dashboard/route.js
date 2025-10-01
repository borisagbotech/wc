import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { dbHelpers } from '@/lib/db';

export async function GET(request) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    await verifyToken(token);

    // Get current date and calculate date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Fetch KPIs (in a real app, these would be actual database queries)
    const [
      activeClients,
      activeCampaigns,
      messagesSent,
      deliveryRate
    ] = await Promise.all([
      // Active clients (last 30 days)
      dbHelpers.get(
        'SELECT COUNT(*) as count FROM clients WHERE status = ? AND last_active >= date(?, ?)',
        ['active', 'now', '-30 days']
      ),
      // Active campaigns
      dbHelpers.get(
        'SELECT COUNT(*) as count FROM campaigns WHERE status = ?',
        ['active']
      ),
      // Messages sent (last 30 days)
      dbHelpers.get(
        'SELECT COUNT(*) as count FROM messages WHERE created_at >= date(?, ?)',
        ['now', '-30 days']
      ),
      // Delivery rate (last 30 days)
      dbHelpers.get(
        `SELECT 
          COALESCE(
            ROUND(
              (SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0) / 
              NULLIF(COUNT(*), 0), 
            2), 
            0
          ) as rate 
        FROM messages 
        WHERE created_at >= date(?, ?)`,
        ['now', '-30 days']
      )
    ]);

    // Generate message analytics data (last 6 months)
    const messageAnalytics = [];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));

      // In a real app, you would query the database for actual message counts
      messageAnalytics.push({
        name: date.toLocaleString('default', { month: 'short' }),
        sent: Math.floor(Math.random() * 5000) + 1000,
        delivered: Math.floor(Math.random() * 4500) + 1000,
        read: Math.floor(Math.random() * 4000) + 800
      });
    }

    // Generate campaign performance data
    const campaignPerformance = [
      { name: 'Campaign 1', clicks: 4000, ctr: 24, conversion: 12 },
      { name: 'Campaign 2', clicks: 3000, ctr: 18, conversion: 9 },
      { name: 'Campaign 3', clicks: 2000, ctr: 15, conversion: 7 },
      { name: 'Campaign 4', clicks: 2780, ctr: 20, conversion: 10 },
      { name: 'Campaign 5', clicks: 1890, ctr: 12, conversion: 6 },
    ];

    // Recent activity (last 10 activities)
    const recentActivity = [
      { id: 1, type: 'campaign', action: 'completed', title: 'Summer Sale', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 2, type: 'message', action: 'sent', title: 'Weekly Newsletter', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
      { id: 3, type: 'user', action: 'created', title: 'New user registered', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { id: 4, type: 'campaign', action: 'started', title: 'Product Launch', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
      { id: 5, type: 'message', action: 'failed', title: 'Promotional Offer', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
    ];

    return NextResponse.json({
      kpis: {
        activeClients: activeClients?.count || 0,
        activeCampaigns: activeCampaigns?.count || 0,
        messagesSent: messagesSent?.count || 0,
        deliveryRate: deliveryRate?.rate || 0
      },
      messageAnalytics,
      campaignPerformance,
      recentActivity
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
