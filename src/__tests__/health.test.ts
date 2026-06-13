import { GET } from "@/app/api/health/route";

beforeEach(() => {
  delete process.env.DATABASE_URL;
});

describe("GET /api/health", () => {
  it("returns 200 with status ok and memory db indicator", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.timestamp).toBe("string");
    expect(body.db).toBe("memory");
  });

  it("reports postgres db indicator when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgresql://fake:fake@localhost:5432/todos";
    const res = await GET();
    const body = await res.json();
    expect(body.db).toBe("postgres");
  });
});
