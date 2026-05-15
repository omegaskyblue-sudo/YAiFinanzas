import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getDb } from "./database";

type ExportRow = {
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
};

async function getTransactionsForExport(
  startDate: string,
  endDate: string,
): Promise<ExportRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT t.date, t.type, t.amount, t.description, c.name as category
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.date >= ? AND t.date <= ?
     ORDER BY t.date DESC`,
    startDate,
    endDate,
  );
  return rows as ExportRow[];
}

function rowToCSV(row: ExportRow): string {
  const desc = row.description ?? "";
  const escapedDesc = `"${desc.replace(/"/g, '""')}"`;
  return `${row.date},${row.type},${row.category},${escapedDesc},${row.amount}`;
}

export async function exportTransactionsToCSV(
  startDate: string,
  endDate: string,
) {
  const txs = await getTransactionsForExport(startDate, endDate);

  const header = "fecha,tipo,categoria,descripcion,monto";
  const body = txs.map(rowToCSV).join("\n");
  const csv = `${header}\n${body}`;

  const filename = `yaifinanzas_${startDate}_${endDate}.csv`;
  const file = new File(Paths.cache, filename);
  file.write(csv);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      dialogTitle: "Exportar movimientos",
    });
  }
}
