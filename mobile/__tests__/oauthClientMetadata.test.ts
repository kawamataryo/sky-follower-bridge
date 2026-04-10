import { describe, expect, it } from "vitest";
import mobileMetadata from "~/assets/oauth-client-metadata.json";
import { createMobileOAuthClientMetadata } from "../../server/src/lib/mobileOAuthClientMetadata";

describe("OAuth client metadata canonical consistency", () => {
  it("mobile asset matches server canonical output by deep equality", () => {
    const serverMetadata = createMobileOAuthClientMetadata();
    expect(mobileMetadata).toEqual(serverMetadata);
  });

  it("mobile asset matches server canonical output byte-for-byte in JSON.stringify", () => {
    const serverMetadata = createMobileOAuthClientMetadata();
    expect(JSON.stringify(mobileMetadata)).toBe(JSON.stringify(serverMetadata));
  });

  it("uses native application_type", () => {
    const metadata = createMobileOAuthClientMetadata();
    expect(metadata.application_type).toBe("native");
  });

  it("uses custom scheme redirect URI with single slash (reverse-FQDN of client_id host)", () => {
    const metadata = createMobileOAuthClientMetadata();
    // AT Protocol OAuth spec requires the scheme to be the reverse-FQDN of
    // client_id's host. client_id = https://server.sky-follower-bridge.dev/...
    // → scheme = dev.sky-follower-bridge.server
    expect(metadata.redirect_uris).toEqual([
      "dev.sky-follower-bridge.server:/oauth-callback",
    ]);
  });

  it("client_id points to canonical production URL", () => {
    const metadata = createMobileOAuthClientMetadata();
    expect(metadata.client_id).toBe(
      "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json",
    );
  });
});
