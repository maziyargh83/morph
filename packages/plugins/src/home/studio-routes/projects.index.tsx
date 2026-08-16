import { For } from "solid-js";
import { Link, createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";

type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "review";
  updatedAt: string;
};

const getProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<Project[]> => [
    {
      id: "atlas",
      name: "Atlas",
      description: "Composable workspace shell and navigation system.",
      status: "active",
      updatedAt: "Today",
    },
    {
      id: "relay",
      name: "Relay",
      description: "Event routing and plugin-to-plugin communication.",
      status: "review",
      updatedAt: "Yesterday",
    },
    {
      id: "canvas",
      name: "Canvas",
      description: "A visual editor experiment for Studio surfaces.",
      status: "draft",
      updatedAt: "3 days ago",
    },
  ],
);

export const Route = createFileRoute("/projects/")({
  loader: () => getProjects(),
  head: () => ({ meta: [{ title: "Projects · Morph Studio" }] }),
  pendingComponent: () => <div class="panel">Loading projects…</div>,
  component: StudioProjects,
});

function StudioProjects() {
  const projects = Route.useLoaderData();

  return (
    <section class="page-section">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Server function + route loader</p>
          <h1>Projects</h1>
        </div>
        <span class="count">{projects().length} projects</span>
      </div>

      <div class="project-list">
        <For each={projects()}>
          {(project) => (
            <Link
              class="project-row"
              to="/projects/$projectId"
              params={{ projectId: project.id }}
            >
              <span class={`status status-${project.status}`} />
              <span class="project-copy">
                <strong>{project.name}</strong>
                <small>{project.description}</small>
              </span>
              <span class="project-meta">
                <small>{project.status}</small>
                <small>{project.updatedAt}</small>
              </span>
            </Link>
          )}
        </For>
      </div>
    </section>
  );
}
