import { vi } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn(),
    redirect: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(),
  })),
  cookies: vi.fn(),
}));
