type AboutPageProps = {
  onBack: () => void
}

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <main className="page-wrap">
      <section className="about-card">
        <h2>About This Project</h2>
        <p>Hi, I am Chamal.</p>
        <p>I built this RAG application for learning purposes using Ballerina and Pinecone.</p>
        <p>
          The assistant is based on the entire knowledge currently available in support.sliit.lk.
        </p>
        <button type="button" className="link-btn" onClick={onBack}>
          Back to Chat
        </button>
      </section>
    </main>
  )
}
