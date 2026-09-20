# Firefox / AMO releases

`Publish Firefox` builds the Firefox target and submits updates to the existing
listed add-on `sky-follower-bridge@ryo.kawamata` using Mozilla's `web-ext` 10.6.0.
Chrome and Firefox have separate tags, jobs, and concurrency groups.

## One-time credentials

In the account that owns the add-on, open
https://addons.mozilla.org/developers/addon/api/key/ and generate API credentials.
Store them in the GitHub **environment** `firefox-amo`:

- `AMO_API_KEY`: JWT issuer / API key.
- `AMO_API_SECRET`: JWT secret.

Use GitHub Settings → Environments → firefox-amo → Environment secrets, or
`gh secret set AMO_API_KEY --env firefox-amo` and
`gh secret set AMO_API_SECRET --env firefox-amo` (enter at the hidden prompt).
Never paste credentials into a chat, command argument, source file, or PR.
The previous `PUBLISH_KEYS` secret is not read or changed.

## Release

After the workflow is merged into main, first build without submission:

```sh
gh workflow run publish-firefox.yml --ref main -f version=3.2.1 -f submit=false
```

Inspect the artifacts and lint warnings. Confirm the version is newer than the
existing AMO version and that another submission is not pending. Bump the package
and lockfile version together for a new release. Then either manually submit:

```sh
gh workflow run publish-firefox.yml --ref main -f version=VERSION -f submit=true
```

Or push a matching tag at the reviewed main commit:

```sh
git tag firefox-vVERSION <reviewed-main-commit>
git push origin firefox-vVERSION
```

The build job runs code checks, tests, Firefox build, Mozilla lint, and manifest
identity/version checks. It packages the extension and reviewer source separately,
records SHA256 hashes, and rebuilds from the extracted reviewer source archive.
The publish job verifies hashes and uses the validated extension files; credentials
are provided only to the submission step, after tool installation.

`--channel listed` updates the public AMO listing; `--upload-source-code` includes
reviewer sources. `--approval-timeout 0` stops waiting after submission. Successful
CI means submitted, **not necessarily approved, signed, or publicly available**.
Check review/publication state in https://addons.mozilla.org/developers/ . AMO's
existing release settings and review outcome determine actual publication timing.

If a run fails or times out after upload, inspect the Developer Hub before retrying.
A submission may already exist. Duplicate versions are not automatically bumped or
replaced, and this workflow never cancels pending reviews.

## Known current validation findings

Local validation of 3.2.1 using web-ext 10.6.0 produced 0 errors and 10 warnings:
missing `data_collection_permissions`, eight dynamic `innerHTML` assignments, and
one Function-constructor warning in generated bundles. These are not automatically
suppressed. Errors fail CI; warnings are visible in the run and must be assessed
before a release. Do not declare `data_collection_permissions: none` without
reviewing actual data transmission. Real-site logged-in testing remains separate.

References:
- https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign
- https://extensionworkshop.com/documentation/publish/source-code-submission/
