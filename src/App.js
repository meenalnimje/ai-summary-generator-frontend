import { useState } from "react";
import "./App.css";
import pdfToText from "react-pdftotext";

function App() {
  const [fileType, setFileType] = useState("pdf");
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (fileType === "pdf") {
      try {
        const text = await pdfToText(file);
        setExtractedText(text);
      } catch (error) {
        console.error("Failed to extract text from PDF", error);
      }
    } else if (fileType === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setExtractedText(e.target.result);
      };
      reader.onerror = (error) => {
        console.error("Failed to read TXT file", error);
      };
      reader.readAsText(file);
    }
  };

  const getSummary = async () => {
    if (!extractedText) {
      alert("Please upload a file first!");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_PUBLIC_KEY}/api/summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: extractedText, prompt }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch summary");

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      alert("Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!email) {
      alert("Please enter recipient email!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_PUBLIC_KEY}/api/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, summary, subject }),
        }
      );

      if (!response.ok) throw new Error("Failed to send email");

      alert("Summary sent successfully!");
      setEmail("");
      setSubject("");
    } catch (error) {
      console.error("Error sending email", error);
      alert("Error sending email");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload a File</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Select File Type:{" "}
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept={fileType === "pdf" ? "application/pdf" : ".txt"}
          onChange={handleFileChange}
        />
      </div>

      <div
        style={{
          marginTop: "20px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          border: "1px solid #ccc",
          padding: "10px",
          maxHeight: "200px",
          overflowY: "scroll",
        }}
      >
        {extractedText || "No text extracted yet."}
      </div>

      {/* Prompt input */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: "300px", padding: "5px" }}
        />
      </div>

      <button
        onClick={getSummary}
        style={{ marginTop: "20px", padding: "10px 20px" }}
        disabled={loading}
      >
        {loading ? "Generating Summary..." : "Get Summary"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Summary (Editable)</h3>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={8}
          style={{ width: "100%", fontFamily: "monospace", padding: "10px" }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Share Summary via Email</h3>

        <input
          type="email"
          placeholder="Recipient email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "300px", padding: "5px", marginBottom: "10px" }}
        />
        <br />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "300px", padding: "5px" }}
        />

        <button
          onClick={sendEmail}
          style={{ marginLeft: "10px", padding: "5px 15px" }}
        >
          Send Email
        </button>
      </div>
    </div>
  );
}

export default App;
