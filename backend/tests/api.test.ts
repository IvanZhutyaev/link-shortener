import request from "supertest";
import { urlService } from "../src/container";
import { createApp } from "../src/app";
import { CyclicRedirectError, InvalidUrlError, UrlNotFoundError } from "../src/types/errors";

jest.mock("../src/container", () => ({
  urlService: {
    shorten: jest.fn(),
    resolveForRedirect: jest.fn(),
    getStats: jest.fn(),
  },
}));

const mockedUrlService = urlService as unknown as {
  shorten: jest.Mock;
  resolveForRedirect: jest.Mock;
  getStats: jest.Mock;
};

const app = createApp();

const errorShape = (statusCode: number, message: string) => ({
  error: {
    message,
    statusCode,
  },
});

describe("REST API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/shorten returns shortCode and shortUrl", async () => {
    mockedUrlService.shorten.mockResolvedValue({
      shortCode: "aB3dE9",
      shortUrl: "http://localhost:3000/aB3dE9",
    });

    const response = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "https://example.com/page" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      shortCode: "aB3dE9",
      shortUrl: "http://localhost:3000/aB3dE9",
    });
    expect(mockedUrlService.shorten).toHaveBeenCalledWith("https://example.com/page");
  });

  it("POST /api/shorten returns 400 for an invalid URL in a unified error body", async () => {
    mockedUrlService.shorten.mockRejectedValue(new InvalidUrlError());

    const response = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "ftp://example.com" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      errorShape(400, "Invalid URL. Expected a valid HTTP or HTTPS address")
    );
  });

  it("POST /api/shorten returns 400 when originalUrl is missing", async () => {
    const response = await request(app).post("/api/shorten").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.statusCode).toBe(400);
    expect(response.body.error.message).toContain("originalUrl");
    expect(mockedUrlService.shorten).not.toHaveBeenCalled();
  });

  it("POST /api/shorten returns 400 for a cyclic redirect", async () => {
    mockedUrlService.shorten.mockRejectedValue(new CyclicRedirectError());

    const response = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "http://localhost:3000/aB3dE9" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      errorShape(400, "URL points to this service and would create a redirect loop")
    );
  });

  it("GET /:shortCode redirects to the original URL", async () => {
    mockedUrlService.resolveForRedirect.mockResolvedValue("https://example.com/page");

    const response = await request(app).get("/aB3dE9");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("https://example.com/page");
  });

  it("GET /:shortCode returns 404 when the code is unknown", async () => {
    mockedUrlService.resolveForRedirect.mockRejectedValue(new UrlNotFoundError("zzzzzz"));

    const response = await request(app).get("/zzzzzz");

    expect(response.status).toBe(404);
    expect(response.body).toEqual(errorShape(404, "Short code not found: zzzzzz"));
  });

  it("GET /api/stats/:shortCode returns analytics", async () => {
    const createdAt = new Date("2026-09-07T12:00:00.000Z");
    mockedUrlService.getStats.mockResolvedValue({
      originalUrl: "https://example.com/page",
      shortCode: "aB3dE9",
      clicks: 3,
      createdAt,
    });

    const response = await request(app).get("/api/stats/aB3dE9");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      originalUrl: "https://example.com/page",
      shortCode: "aB3dE9",
      clicks: 3,
    });
  });

  it("GET /health returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
