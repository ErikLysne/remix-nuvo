/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useSubmit } from "@remix-run/react";
import React from "react";
import { ClientOnly } from "remix-utils/client-only";

// It is necessary to wrap the NuvoImporter component in React.lazy to avoid importing it on the server.
// By doing so, we avoid the error "Cannot use import statement outside a module".
const NuvoImporter = React.lazy(() =>
  import("nuvo-react").then((module) => ({ default: module.NuvoImporter }))
);

export const loader = async () => {
  // The license key is loaded from process.env on the server and passed to the client through useLoaderData.
  const NUVO_LICENSE_KEY = process.env.NUVO_LICENSE_KEY!;

  return json({ NUVO_LICENSE_KEY });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.json();

  // Nuvo results are logged on the server 🎉
  console.log("Results:");
  console.log(data);

  return null;
};

export default function Nuvo() {
  const { NUVO_LICENSE_KEY } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    // It is necessary to wrap the NuvoImporter component in ClientOnly to avoid importing it on the server.
    // By doing so, we avoid the error "Cannot use import statement outside a module".
    <ClientOnly>
      {() => (
        // Because the NuvoImporter component is wrapped in React.lazy, it is necessary to wrap it in React.Suspense as well.
        <React.Suspense fallback="Loading...">
          <NuvoImporter
            licenseKey={NUVO_LICENSE_KEY}
            onResults={async (results) => {
              submit(results as any, {
                method: "POST",
                encType: "application/json",
              });
            }}
            settings={{
              developerMode: true,
              embedUploadArea: true,
              modal: false,
              identifier: "remix_test",
              columns: [
                {
                  key: "name",
                  label: "Name",
                  columnType: "string",
                },
                {
                  key: "email",
                  label: "Email",
                  columnType: "email",
                },
                {
                  key: "phone",
                  label: "Phone",
                  columnType: "phone",
                },
              ],
            }}
          />
        </React.Suspense>
      )}
    </ClientOnly>
  );
}
