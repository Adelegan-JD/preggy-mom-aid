/**
 * A tiny chainable query builder that mimics the parts of supabase-js this app uses.
 * It only records the query; an executor (server: local file store, browser:
 * /api/dev-mock) runs it. Shared by the server and browser demo clients.
 */

export type Filter = { op: "eq" | "in" | "gte" | "ilike"; column: string; value: unknown };
export type QuerySpec = {
  table: string;
  action: "select" | "insert" | "update" | "delete" | "upsert";
  values?: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
  filters: Filter[];
  order?: { column: string; ascending: boolean };
  limit?: number;
  single?: "single" | "maybeSingle";
  count?: boolean;
  head?: boolean;
  returning?: boolean;
};
export type QueryResult = { data: unknown; error: { message: string } | null; count?: number | null };
export type Executor = (spec: QuerySpec) => Promise<QueryResult>;

export function createQueryBuilder(table: string, execute: Executor) {
  const spec: QuerySpec = { table, action: "select", filters: [] };
  const builder = {
    select(_columns?: string, options?: { count?: string; head?: boolean }) {
      if (spec.action === "select") { spec.count = Boolean(options?.count); spec.head = Boolean(options?.head); }
      else spec.returning = true;
      return builder;
    },
    insert(values: QuerySpec["values"]) { spec.action = "insert"; spec.values = values; return builder; },
    update(values: Record<string, unknown>) { spec.action = "update"; spec.values = values; return builder; },
    upsert(values: QuerySpec["values"], options?: { onConflict?: string }) { spec.action = "upsert"; spec.values = values; spec.onConflict = options?.onConflict; return builder; },
    delete() { spec.action = "delete"; return builder; },
    eq(column: string, value: unknown) { spec.filters.push({ op: "eq", column, value }); return builder; },
    in(column: string, value: unknown[]) { spec.filters.push({ op: "in", column, value }); return builder; },
    gte(column: string, value: unknown) { spec.filters.push({ op: "gte", column, value }); return builder; },
    ilike(column: string, value: string) { spec.filters.push({ op: "ilike", column, value }); return builder; },
    order(column: string, options?: { ascending?: boolean }) { spec.order = { column, ascending: options?.ascending ?? true }; return builder; },
    limit(count: number) { spec.limit = count; return builder; },
    single() { spec.single = "single"; return builder; },
    maybeSingle() { spec.single = "maybeSingle"; return builder; },
    then<T>(resolve: (value: QueryResult) => T, reject?: (reason: unknown) => T) {
      return execute(spec).then(resolve, reject);
    },
  };
  return builder;
}

/** Runs a query spec against in-memory tables. Pure; used by the server store. */
export function runQuery(tables: Record<string, Record<string, unknown>[]>, spec: QuerySpec): QueryResult {
  const rows = (tables[spec.table] ??= []);
  const matches = (row: Record<string, unknown>) => spec.filters.every(filter => {
    const value = row[filter.column];
    if (filter.op === "eq") return value === filter.value;
    if (filter.op === "in") return (filter.value as unknown[]).includes(value);
    if (filter.op === "gte") return String(value ?? "") >= String(filter.value);
    const needle = String(filter.value).replaceAll("%", "").toLowerCase();
    return String(value ?? "").toLowerCase().includes(needle);
  });
  const now = new Date().toISOString();
  const finish = (result: Record<string, unknown>[]) => {
    if (spec.single) {
      if (spec.single === "single" && result.length === 0) return { data: null, error: { message: "No rows found" } };
      return { data: result[0] ?? null, error: null };
    }
    return { data: result, error: null };
  };

  if (spec.action === "select") {
    let result = rows.filter(matches);
    if (spec.order) {
      const { column, ascending } = spec.order;
      result = [...result].sort((a, b) => String(a[column] ?? "").localeCompare(String(b[column] ?? "")) * (ascending ? 1 : -1));
    }
    const count = result.length;
    if (spec.limit !== undefined) result = result.slice(0, spec.limit);
    if (spec.head) return { data: null, error: null, count };
    return { ...finish(result), count: spec.count ? count : null };
  }

  if (spec.action === "insert" || spec.action === "upsert") {
    const list = Array.isArray(spec.values) ? spec.values : [spec.values ?? {}];
    const written = list.map(values => {
      const key = spec.onConflict;
      const existing = spec.action === "upsert" && key ? rows.find(row => row[key] === values[key]) : undefined;
      if (existing) { Object.assign(existing, values, { updated_at: now }); return existing; }
      const row = { id: crypto.randomUUID(), created_at: now, ...defaultsFor(spec.table, now), ...values };
      rows.push(row);
      return row;
    });
    return spec.returning ? finish(written) : { data: null, error: null };
  }

  if (spec.action === "update") {
    const updated = rows.filter(matches);
    updated.forEach(row => Object.assign(row, spec.values));
    return spec.returning ? finish(updated) : { data: null, error: null };
  }

  // delete
  const keep = rows.filter(row => !matches(row));
  tables[spec.table] = keep;
  return { data: null, error: null };
}

function defaultsFor(table: string, now: string): Record<string, unknown> {
  if (table === "patient_appointments") return { status: "scheduled", updated_at: now };
  if (table === "account_deletion_requests") return { status: "requested", requested_at: now };
  if (table === "professional_applications") return { status: "pending" };
  return {};
}
