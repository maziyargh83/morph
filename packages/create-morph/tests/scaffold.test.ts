import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { scaffoldClient } from "../src/scaffold.ts";

test("scaffolds independent CSR and SSR clients from the canonical apps", async () => {
  const root = await mkdtemp(join(tmpdir(), "morph-create-"));
  const appsDirectory = join(root, "apps");

  try {
    const csr = await scaffoldClient({
      name: "shop-csr",
      template: "csr",
      appsDirectory,
      port: 6101,
    });
    const ssr = await scaffoldClient({
      name: "shop-ssr",
      template: "ssr",
      appsDirectory,
      port: 6102,
    });

    assert.equal(csr.packageName, "@morph/shop-csr");
    assert.equal(ssr.packageName, "@morph/shop-ssr");
    assert.match(
      await readFile(join(csr.destination, "src/main.tsx"), "utf8"),
      /requireClientPageAccess/,
    );
    assert.match(
      await readFile(join(ssr.destination, "src/router.tsx"), "utf8"),
      /requireClientSsrPageAccess/,
    );
    assert.match(
      await readFile(join(ssr.destination, "src/routes/__root.tsx"), "utf8"),
      /import "\.\.\/styles\.css"/,
    );
    await assert.rejects(
      scaffoldClient({
        name: "shop-csr",
        template: "csr",
        appsDirectory,
      }),
      /Destination already exists/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
