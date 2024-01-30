import React from "react";
import Lottie from "react-lottie";
import animationData3 from "./Assets/Confetti.json";

const ThankYou = () => {
  return (
    <div style={{ maxHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          maxHeight: "100vh",
          flexDirection: "column",
          backgroundColor: "#f0f0f0", // Light background color
          color: "#333", // Dark text color for contrast
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
          Survey complete! Thank You for Your Contribution!
        </h1>
        <div style={{ position: "absolute" }}>
          <Lottie options={{ animationData: animationData3 }} />
        </div>

        <p
          style={{
            fontSize: "1.2rem",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
        >
          Your annotations play a crucial role in shaping a kinder and more
          understanding world. By contributing your insights, you're helping us
          better understand diverse perspectives and foster a more inclusive
          digital space. Each annotation adds a valuable layer to our
          understanding of online interactions, enabling us to create more
          effective tools and resources for promoting positive communication and
          reducing harmful content. Your time and effort in this survey are not
          just appreciated—they're impactful. Together, we're building a safer,
          more respectful online community. Thank you for being an essential
          part of this journey.
        </p>
        <button
          style={{
            marginTop: "30px",
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => window.close()}
        >
          Thank you
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
