import { AppDataSource } from "../dataSource";

export async function getDailyStats(userId: number, days = 7) {
  const rows: { d: string; count: number }[] = await AppDataSource.query(
    `
    SELECT
      ("playedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Paris')::date AS d,
      COUNT(*)::int AS count
    FROM user_histories
    WHERE user_id = $1
      AND "playedAt" >= (now() AT TIME ZONE 'UTC') - ($2 || ' days')::interval
    GROUP BY d
    ORDER BY d;
    `,
    [userId, days]
  );


  // Générer la continuité des jours 
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));

  // Forcer la normalisation des dates au format YYYY-MM-DD
  const map = new Map(
    rows.map(r => [new Date(r.d).toISOString().slice(0, 10), r.count])
  );


  const labels: string[] = [];
  const values: number[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
    labels.push(
      d.toLocaleDateString("fr-FR", { weekday: "short" })
    );
    values.push(map.get(key) ?? 0);
  }

  return { labels, values };
}
