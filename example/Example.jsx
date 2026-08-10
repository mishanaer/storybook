import React, { useEffect, useState } from "react";
import { StorybookShell } from "../src/index.js";

const groups = [
  {
    id: "example",
    title: "Example",
    items: [
      { id: "component", title: "Your Component" },
      { id: "screen", title: "Your Screen" },
    ],
  },
];

function readActiveId() {
  const id = window.location.hash.slice(1);
  return groups[0].items.some((item) => item.id === id) ? id : null;
}

const pages = {
  component: (
    <section className="example-page">
      <span className="example-eyebrow">Preview content</span>
      <h1>Your component goes here</h1>
      <p>The shell does not discover or generate this content. Pass any existing React page as its children.</p>
      <div className="example-component">Product component</div>
    </section>
  ),
  screen: (
    <section className="example-page">
      <span className="example-eyebrow">Preview content</span>
      <h1>Your screen goes here</h1>
      <p>Routing, data, providers, states, and component selection stay under the host application's control.</p>
      <div className="example-screen">
        <div />
        <div />
        <div />
      </div>
    </section>
  ),
};

export function Example() {
  const [activeId, setActiveId] = useState(readActiveId);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const syncHash = () => setActiveId(readActiveId());
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const select = (id) => {
    window.location.hash = id;
  };

  const back = () => {
    history.pushState(null, "", window.location.pathname + window.location.search);
    setActiveId(null);
  };

  return (
    <StorybookShell
      groups={groups}
      activeId={activeId}
      onSelect={select}
      onBack={back}
      theme={theme}
      onToggleTheme={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
    >
      {activeId ? pages[activeId] : null}
    </StorybookShell>
  );
}
