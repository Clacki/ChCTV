import dns from "node:dns/promises";
import https from "node:https";
import { performance } from "node:perf_hooks";

const hostname = "api.chzzk.naver.com";
const path = "/service/v1/channels/ac6a03808bffbe58b3bfb0e25271836e/videos?sortType=LATEST&videoType=REPLAY&page=1";
const url = `https://${hostname}${path}`;
const timeoutMs = 5_000;
const proxyKeys = ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "http_proxy", "https_proxy", "no_proxy"];

function elapsed(startedAt) {
  return Math.round((performance.now() - startedAt) * 10) / 10;
}

async function diagnoseFetch(headers) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
    await response.arrayBuffer();
    return { ok: response.ok, status: response.status, responseHeadersReceived: true, elapsedMs: elapsed(startedAt) };
  } catch (error) {
    return { ok: false, errorName: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : "unknown", elapsedMs: elapsed(startedAt) };
  }
}

async function diagnoseSingleChannelPagination() {
  const startedAt = performance.now();
  let page = 1;
  let totalPages = 1;
  let itemCount = 0;
  let requests = 0;
  let finalResponsePage = null;
  let finalReportedTotalPages = null;

  try {
    while (page <= totalPages) {
      const pageUrl = new URL(url);
      pageUrl.searchParams.set("page", String(page));
      const response = await fetch(pageUrl, {
        headers: { "User-Agent": "ChCTV VOD Collector/1.0" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = await response.json();
      if (!response.ok || !Array.isArray(body?.content?.data) || !Number.isInteger(body?.content?.totalPages)) {
        return { ok: false, errorMessage: "unexpected response", page, elapsedMs: elapsed(startedAt) };
      }
      totalPages = body.content.totalPages;
      finalResponsePage = body.content.page;
      finalReportedTotalPages = totalPages;
      itemCount += body.content.data.length;
      requests += 1;
      page += 1;
    }
    return { ok: true, requests, itemCount, finalResponsePage, finalReportedTotalPages, elapsedMs: elapsed(startedAt) };
  } catch (error) {
    return { ok: false, errorName: error instanceof Error ? error.name : "unknown", errorMessage: error instanceof Error ? error.message : "unknown", page, elapsedMs: elapsed(startedAt) };
  }
}

function diagnoseHttps(family) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const stages = {};
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve({ family: family ?? "default", ...result, stages, elapsedMs: elapsed(startedAt) });
    };

    const request = https.request({ hostname, path, method: "GET", family, headers: { Accept: "application/json" } }, (response) => {
      stages.responseHeadersMs = elapsed(startedAt);
      const headerNames = Object.keys(response.headers);
      response.resume();
      response.on("end", () => finish({ ok: true, status: response.statusCode, responseHeadersReceived: true, headerNames }));
    });

    request.on("socket", (socket) => {
      socket.on("lookup", (_error, address, resolvedFamily) => { stages.dnsLookupMs = elapsed(startedAt); stages.address = address; stages.resolvedFamily = resolvedFamily; });
      socket.on("connect", () => { stages.tcpConnectMs = elapsed(startedAt); });
      socket.on("secureConnect", () => { stages.tlsSecureConnectMs = elapsed(startedAt); });
    });
    request.on("error", (error) => finish({ ok: false, errorCode: error.code, errorMessage: error.message, responseHeadersReceived: false }));
    request.setTimeout(timeoutMs, () => request.destroy(new Error("request timeout")));
    request.end();
  });
}

const report = {
  nodeVersion: process.version,
  url: `https://${hostname}/service/v1/channels/<channel>/videos?...`,
  timeoutMs,
  proxyEnvironmentPresent: Object.fromEntries(proxyKeys.map((key) => [key, Boolean(process.env[key])])),
  dns: await dns.lookup(hostname, { all: true, verbatim: true }),
  fetch: await diagnoseFetch(),
  fetchAcceptJson: await diagnoseFetch({ Accept: "application/json" }),
  fetchCollectorUserAgent: await diagnoseFetch({ "User-Agent": "ChCTV VOD Collector/1.0" }),
  httpsDefault: await diagnoseHttps(),
  httpsIpv4: await diagnoseHttps(4),
  ...(process.argv.includes("--single-channel") ? { singleChannelPagination: await diagnoseSingleChannelPagination() } : {}),
};

console.log(JSON.stringify(report, null, 2));
