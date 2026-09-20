# Chrome Web Store releases

`Publish Chrome` tests and builds the extension, saves a ZIP artifact, then uploads
that exact artifact through Chrome Web Store API v2. A successful submission usually
means **PENDING_REVIEW**, not published. Google publishes after approval.

## One-time setup

1. Choose a Google Cloud project and enable `chromewebstore.googleapis.com`,
   `iamcredentials.googleapis.com`, and `sts.googleapis.com`.
2. Create a service account dedicated to this extension. No project-wide Editor or
   Owner role is needed. In the Chrome Web Store Developer Dashboard's **Account**
   page, link its email as the publisher's service account, and copy the Publisher ID.
3. Create a Workload Identity Federation pool and GitHub OIDC provider with issuer
   `https://token.actions.githubusercontent.com`. Map `google.subject=assertion.sub`,
   `attribute.repository_id=assertion.repository_id`, and
   `attribute.repository_owner_id=assertion.repository_owner_id`.
   Restrict the provider condition to this repository's numeric `repository_id` and
   `repository_owner_id`, and to `assertion.ref == 'refs/heads/main'` or
   `assertion.ref.startsWith('refs/tags/chrome-v')`. Obtain the numeric IDs using
   `gh api repos/kawamataryo/sky-follower-bridge --jq '{repo: .id, owner: .owner.id}'`.
4. Grant `roles/iam.workloadIdentityUser` **on the service account** to
   `principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/attribute.repository_id/REPOSITORY_ID`.
5. Create the GitHub environment `chrome-webstore`. Set these repository/environment
   **variables** (they are identifiers, not secrets):

   | Variable | Value |
   | --- | --- |
   | `CWS_PUBLISHER_ID` | Publisher ID from the store dashboard |
   | `CWS_SERVICE_ACCOUNT` | Service account email |
   | `CWS_WORKLOAD_IDENTITY_PROVIDER` | `projects/NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER` |

The workflow uses short-lived tokens; no JSON private key or refresh token needs to
be stored. The previous `PUBLISH_KEYS` secret is not used or modified.
Restrict who can push release tags using repository rulesets. Trusted release
commits must be reachable from `main`; manual submissions run only on `main`.

Official setup references:
- https://developer.chrome.com/docs/webstore/service-accounts
- https://github.com/google-github-actions/auth#workload-identity-federation-through-a-service-account

## First release / ZIP-only check

After the workflow is merged into `main`:

```sh
# Test and build only; does not need store credentials.
gh workflow run publish-chrome.yml --ref main -f version=3.2.1 -f submit=false
# Test, build, upload, and submit the same version for review.
gh workflow run publish-chrome.yml --ref main -f version=3.2.1 -f submit=true
```

Alternatively, tag the reviewed main commit with the exact package version:

```sh
git tag chrome-v3.2.1 <reviewed-main-commit>
git push origin chrome-v3.2.1
```

For subsequent releases bump `package.json` and the lockfile version together before
merging, then push the matching `chrome-v…` tag. Tagging is the release decision;
ordinary pushes and pull requests do not submit to the store.

## Failure handling

- Existing pending review or staged release: stops before upload. Inspect the existing
  submission in the dashboard; never automatically cancel it.
- Version already published: exits successfully without another upload.
- Upload fails or exceeds five minutes of polling: stops without submitting.
- HTTP error or interrupted job: check the Developer Dashboard before retrying.
  A timed-out request may have reached Google. Logs intentionally omit credentials
  and arbitrary HTTP response bodies.
- Store warning: stops submission for dashboard inspection.
- CI summary distinguishes pending review from published. Actual delivery requires
  checking store status after review; this workflow does not continuously poll review.

Only the production Chrome build is packed. Private support exports, browser
profiles, and source files outside that build directory are not included.
Firefox releases and logged-in real-site testing are outside this workflow.
