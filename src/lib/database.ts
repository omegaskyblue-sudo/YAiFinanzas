import * as SQLite from "expo-sqlite";
import type { Category, Transaction, Budget, SavingsGoal } from "@/types";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("yaifinanzas.db");
  }
  return db;
}

export async function initDatabase() {
  const database = await getDb();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      couple_id TEXT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'receipt',
      type TEXT NOT NULL DEFAULT 'expense',
      color TEXT NOT NULL DEFAULT '#6B7280',
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category_id TEXT,
      description TEXT,
      date TEXT NOT NULL,
      is_split INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      spent REAL NOT NULL DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      couple_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      deadline TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
      record_id TEXT NOT NULL,
      data TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return database;
}

export async function clearLocalData() {
  const database = await getDb();
  await database.execAsync(`
    DELETE FROM categories;
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM savings_goals;
  `);
}
