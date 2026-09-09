import { assertNotCyclicRedirect, normalizeHttpUrl } from "../src/utils/url";
import { CyclicRedirectError, InvalidUrlError } from "../src/types/errors";

describe("URL helpers", () => {
  it("accepts http and https URLs", () => {
    expect(normalizeHttpUrl(" https://example.com/a ")).toBe("https://example.com/a");
    expect(normalizeHttpUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects non-http schemes", () => {
    expect(() => normalizeHttpUrl("javascript:alert(1)")).toThrow(InvalidUrlError);
    expect(() => normalizeHttpUrl("ftp://files.example.com")).toThrow(InvalidUrlError);
  });

  it("detects cyclic redirects on the service host", () => {
    expect(() =>
      assertNotCyclicRedirect("http://localhost:3000/abc123", "http://localhost:3000")
    ).toThrow(CyclicRedirectError);
  });

  it("allows third-party hosts", () => {
    expect(() =>
      assertNotCyclicRedirect("https://example.com", "http://localhost:3000")
    ).not.toThrow();
  });
});
