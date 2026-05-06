type AboutPageProps = {
  onBack: () => void;
};

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <main className="page-wrap">
      <section className="about-card">
        <h2>About This Project</h2>
        <h3>Project Overview</h3>
        <p>
          The SLIIT knowledge base is available on{" "}
          <a
            href="https://support.sliit.lk"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.sliit.lk
          </a>
          , and currently students need to manually go through links, menus, and
          multiple pages to find the details they need. This project makes that
          easier by helping users get relevant information quickly in one place.
        </p>
        <p>
          To implement this, I gathered support content (including PDF content)
          and organized it into Markdown format to improve retrieval quality.
        </p>
        <h3>About Me</h3>
        <p>
          Hi, I am Chamal Senarathna, a Software Engineering undergraduate at
          SLIIT. I discovered the
          <a
            href="https://wso2.com/integration-platform/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            WSO2 Devant Integration Platform
          </a>{" "}
          through a
          <a
            href="https://youtu.be/8GlrHYS-EYI?si=zV4dQ0LSlZW_iZZX"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            YouTube tutorial
          </a>{" "}
          that showed how easy it is to build and deploy a RAG application with
          Devant. Since I had already built projects with
          <a
            href="https://ballerina.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            Ballerina
          </a>
          , I decided to build this project using Ballerina.
        </p>
        <p>
          Contact:{" "}
          <a href="mailto:chamals004@gmail.com">chamals004@gmail.com</a> |{" "}
          <a
            href="https://www.linkedin.com/in/chamalsena"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>{" "}
          |{" "}
          <a
            href="https://www.instagram.com/chamalsena"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </p>
        <button type="button" className="link-btn" onClick={onBack}>
          Back to Chat
        </button>
      </section>
    </main>
  );
}
