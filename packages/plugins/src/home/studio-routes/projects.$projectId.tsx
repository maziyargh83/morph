import { Link, createFileRoute, notFound } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";

type ProjectDetail = {
  id: string;
  name: string;
  summary: string;
  owner: string;
  environment: string;
  modules: string[];
};

const getProject = createServerFn({ method: "GET" })
  .validator((projectId: string) => projectId)
  .handler(async ({ data }): Promise<ProjectDetail> => {
    const projects: Record<string, ProjectDetail> = {
      atlas: {
        id: "atlas",
        name: "Atlas",
        summary: "The shared shell used to compose independently-owned tools.",
        owner: "Platform",
        environment: "Production",
        modules: ["Navigation", "Permissions", "Plugin registry"],
      },
      relay: {
        id: "relay",
        name: "Relay",
        summary: "A typed event layer for communication across plugin borders.",
        owner: "Runtime",
        environment: "Preview",
        modules: ["Event bus", "Contracts", "Telemetry"],
      },
      canvas: {
        id: "canvas",
        name: "Canvas",
        summary: "An exploratory visual editor for configuring Studio pages.",
        owner: "Experience",
        environment: "Development",
        modules: ["Blocks", "Inspector", "Live preview"],
      },
    };

    const project = projects[data];
    if (!project) throw notFound();
    return project;
  });

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => getProject({ data: params.projectId }),
  head: () => ({ meta: [{ title: "Project · Morph Studio" }] }),
  notFoundComponent: () => (
    <section class="panel">
      <p class="eyebrow">Project not found</p>
      <h1>Nothing here.</h1>
      <Link class="button" to="/projects">
        Back to projects
      </Link>
    </section>
  ),
  component: ProjectPage,
});

function ProjectPage() {
  const project = Route.useLoaderData();

  return (
    <section class="page-section">
      <Link class="back-link" to="/projects">
        ← All projects
      </Link>
      <div class="detail-heading">
        <div>
          <p class="eyebrow">Dynamic route + validated server function</p>
          <h1>{project().name}</h1>
          <p class="lede">{project().summary}</p>
        </div>
        <span class="project-id">{project().id}</span>
      </div>
      <dl class="detail-grid">
        <div>
          <dt>Owner</dt>
          <dd>{project().owner}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{project().environment}</dd>
        </div>
        <div>
          <dt>Modules</dt>
          <dd>{project().modules.join(" · ")}</dd>
        </div>
      </dl>
    </section>
  );
}
