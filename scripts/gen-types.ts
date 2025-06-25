// scripts/gen-types.ts
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import postgres from "postgres";

// 1) 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ .env.local에 DATABASE_URL이 없습니다.");
  process.exit(1);
}

// 2) postgres 클라이언트 (PGBouncer 호환)
const sql = postgres(connectionString, {
  // 옵션을 바꿔야 하면 여기에…
  // ssl: { rejectUnauthorized: true },
});

async function main() {
  // 3) public 스키마 테이블 목록
  const tables: { table_name: string }[] = await sql`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE';
  `;

  let out = `/** AUTO-GENERATED TYPES **/\n`;
  out += `export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];\n\n`;
  out += `export interface Database {\n  public: {\n    Tables: {\n`;

  // 타입 매핑 함수
  function mapPgTypeToTs(pgType: string) {
    if (pgType.includes("timestamp") || pgType === "date") return "string";
    if (
      ["integer","bigint","smallint","numeric","real","double precision","decimal"]
        .includes(pgType)
    ) return "number";
    if (pgType === "boolean") return "boolean";
    return "any";
  }

  for (const { table_name } of tables) {
    const cols: {
      column_name: string;
      data_type: string;
      is_nullable: "YES" | "NO";
    }[] = await sql`
      SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = ${table_name};
    `;

    out += `      "${table_name}": {\n`;
    out += `        Row: {\n`;
    for (const { column_name, data_type, is_nullable } of cols) {
      const tsType = mapPgTypeToTs(data_type);
      const nullable = is_nullable === "YES" ? " | null" : "";
      out += `          ${column_name}: ${tsType}${nullable};\n`;
    }
    out += `        };\n`;
    out += `        Insert: Partial<Omit<Database["public"]["Tables"]["${table_name}"]["Row"], "id" | "created_at">>;\n`;
    out += `        Update: Partial<Database["public"]["Tables"]["${table_name}"]["Row"]>;\n`;
    out += `      };\n`;
  }

  out += `    };\n    Views: {};\n    Functions: {};\n    Enums: {};\n  };\n}\n`;

  // 4) 파일 쓰기
  const target = path.resolve(process.cwd(), "utilities/serverutil/types.ts");
  fs.writeFileSync(target, out, "utf8");
  console.log("✅ types.ts 생성 완료:", target);

  await sql.end(); // 연결 종료
}

main().catch((err) => {
  console.error("❌ gen-types 에러:", err);
  process.exit(1);
});
